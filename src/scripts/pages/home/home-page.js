import StoryModel from '../../models/story-model';
import HomePresenter from '../../presenters/home-presenter';
import { getAuthToken } from '../../data/auth-store';
import { showFormattedDate } from '../../utils/index';
import { isPushSupported, getCurrentSubscription, enablePush, disablePush } from '../../utils/push-manager';

// Leaflet (map)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon path in webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class HomePage {
  #presenter;
  #map;
  #markers = new Map();

  async render() {
    return `
      <section class="container">
        <div class="page-header">
          <h1>Beranda</h1>
          <p class="sub">Cerita terbaru dari komunitas Dicoding.</p>

          <div class="header-actions">
            <a class="button" href="#/add">+ Tambah Story</a>
            <button class="button secondary" type="button" id="push-toggle">Push: ...</button>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h2 class="card-title">Daftar Story</h2>
            <div id="stories-feedback" class="feedback" aria-live="polite"></div>
            <div id="stories-loading" class="loading" hidden>Memuat story...</div>
            <ul id="stories-list" class="story-list" aria-label="Daftar story"></ul>
          </div>

          <div class="card">
            <h2 class="card-title">Peta Story</h2>
            <p class="hint">Klik sebuah story di daftar untuk menyorot markernya.</p>
            <div id="map" class="map" role="region" aria-label="Peta lokasi story"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = getAuthToken();
    if (!token) {
      location.hash = '#/login';
      return;
    }

    this.#presenter = new HomePresenter({
      model: new StoryModel(),
      view: this,
      token,
    });

    await this.#presenter.loadStories();

    // === PUSH NOTIFICATION TOGGLE ===
    const pushBtn = document.getElementById('push-toggle');
    if (pushBtn) {
      const setLabel = (enabled) => {
        pushBtn.textContent = enabled ? 'Push: ON' : 'Push: OFF';
      };

      if (!(await isPushSupported())) {
        pushBtn.disabled = true;
        pushBtn.textContent = 'Push: Tidak didukung';
        return;
      }

      const sub = await getCurrentSubscription();
      setLabel(Boolean(sub));

      pushBtn.addEventListener('click', async () => {
        pushBtn.disabled = true;
        try {
          const current = await getCurrentSubscription();
          if (current) {
            await disablePush();
            setLabel(false);
          } else {
            await enablePush();
            setLabel(true);
          }
        } catch (e) {
          this.showError(e);
        } finally {
          pushBtn.disabled = false;
        }
      });
    }
  }

  showLoading() {
    const el = document.getElementById('stories-loading');
    if (el) el.hidden = false;
  }

  showError(err) {
    const loading = document.getElementById('stories-loading');
    if (loading) loading.hidden = true;
    const feedback = document.getElementById('stories-feedback');
    if (feedback) {
      feedback.innerHTML = `<p class="error">Gagal memuat story: ${this.#escape(err.message)}</p>`;
    }
  }

  renderStories(stories) {
    const loading = document.getElementById('stories-loading');
    if (loading) loading.hidden = true;

    const list = document.getElementById('stories-list');
    if (!list) return;

    list.innerHTML = stories
      .map((s) => {
        const created = showFormattedDate(s.createdAt, 'id-ID');
        return `
          <li class="story-item">
            <article>
              <button class="story-item-button" data-story-id="${s.id}">
                <img class="story-thumb" src="${s.photoUrl}" alt="Foto story oleh ${this.#escape(s.name)}" loading="lazy" />
                <div class="story-meta">
                  <h3 class="story-title">${this.#escape(s.name)}</h3>
                  <p class="story-desc">${this.#escape(s.description)}</p>
                  <p class="story-date">${created}</p>
                </div>
              </button>
              <div class="story-links">
                <a class="link" href="#/stories/${s.id}">Lihat detail</a>
              </div>
            </article>
          </li>
        `;
      })
      .join('');

    // Interactivity: list ↔ map highlight
    list.querySelectorAll('.story-item-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-story-id');
        this.highlightMarker(id);
      });
    });
  }

  renderMap(stories) {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    // Prevent double init when navigating back
    mapEl.innerHTML = '';

    this.#map = L.map(mapEl, {
      center: [0.7893, 113.9213], // Indonesia
      zoom: 4,
    });

    // Multiple tile layers (Advance criteria)
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.#map);

    const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    });

    L.control.layers({
      'OpenStreetMap': osm,
      'Carto Light': carto,
    }).addTo(this.#map);

    this.#markers.clear();

    const bounds = [];

    stories.forEach((s) => {
      if (typeof s.lat !== 'number' || typeof s.lon !== 'number') return;

      const marker = L.marker([s.lat, s.lon]);
      marker.bindPopup(
        `<strong>${this.#escape(s.name)}</strong><br/>${this.#escape(s.description)}`,
      );
      marker.addTo(this.#map);
      this.#markers.set(s.id, marker);
      bounds.push([s.lat, s.lon]);

      // Interactivity: marker → scroll to list
      marker.on('click', () => {
        const target = document.querySelector(`[data-story-id="${s.id}"]`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    if (bounds.length) {
      this.#map.fitBounds(bounds, { padding: [24, 24] });
    }
  }

  highlightMarker(storyId) {
    const marker = this.#markers.get(storyId);
    if (!marker || !this.#map) return;
    marker.openPopup();
    this.#map.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
  }

  #escape(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
