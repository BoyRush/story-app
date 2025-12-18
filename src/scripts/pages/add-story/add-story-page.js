import StoryModel from '../../models/story-model';
import AddStoryPresenter from '../../presenters/add-story-presenter';
import { getAuthToken } from '../../data/auth-store';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class AddStoryPage {
  #presenter;
  #map;
  #pickedMarker;
  #mediaStream;
  #capturedFile;
  #isSubmitting = false;

  async render() {
    return `
      <section class="container">
        <div class="page-header">
          <h1>Tambah Story</h1>
          <p class="sub">Unggah cerita baru lengkap dengan foto dan lokasi (opsional).</p>
        </div>

        <div class="grid">
          <div class="card">
            <h2 class="card-title">Form Story</h2>
            <div id="form-feedback" class="feedback" aria-live="polite"></div>

            <form id="story-form" class="form" novalidate>
              <div class="form-group">
                <label for="description">Deskripsi</label>
                <textarea id="description" name="description" rows="4" required></textarea>
              </div>

              <fieldset class="form-group">
                <legend>Foto</legend>
                <label for="photo">Pilih gambar (maks 1MB)</label>
                <input id="photo" name="photo" type="file" accept="image/*" required />
                <p class="field-hint">Atau gunakan kamera di bawah (opsional).</p>

                <div class="camera">
                  <div class="camera-actions">
                    <button type="button" class="button secondary" id="open-camera">Buka Kamera</button>
                    <button type="button" class="button secondary" id="capture">Ambil Foto</button>
                    <button type="button" class="button secondary" id="close-camera">Tutup Kamera</button>
                  </div>
                  <video id="camera-video" class="camera-video" playsinline muted hidden></video>
                  <canvas id="camera-canvas" class="camera-canvas" hidden></canvas>
                  <img id="camera-preview" class="camera-preview" alt="Pratinjau foto dari kamera" hidden />
                </div>
              </fieldset>

              <fieldset class="form-group">
                <legend>Lokasi (klik peta atau isi manual)</legend>
                <div class="two-col">
                  <div>
                    <label for="lat">Latitude</label>
                    <input id="lat" name="lat" type="number" step="any" inputmode="decimal" />
                  </div>
                  <div>
                    <label for="lon">Longitude</label>
                    <input id="lon" name="lon" type="number" step="any" inputmode="decimal" />
                  </div>
                </div>
                <p class="hint">Klik peta untuk mengisi lat/lon otomatis.</p>
              </fieldset>

              <div class="form-group">
                <div class="checkbox-row">
                  <input type="checkbox" id="asGuest" name="asGuest" />
                  <label for="asGuest">Kirim sebagai guest (tanpa login)</label>
                </div>
              </div>

              <button class="button" type="submit" id="submit-btn">Kirim Story</button>
            </form>
          </div>

          <div class="card">
            <h2 class="card-title">Peta</h2>
            <div id="map" class="map" role="region" aria-label="Peta untuk memilih lokasi story"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = getAuthToken();

    this.#presenter = new AddStoryPresenter({
      model: new StoryModel(),
      view: this,
      token,
    });

    this.#initMap();
    this.#initCamera();

    const form = document.getElementById('story-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.#isSubmitting) return;

      const description = form.description.value.trim();
      const lat = form.lat.value;
      const lon = form.lon.value;
      const asGuest = document.getElementById('asGuest').checked;

      const photoInput = document.getElementById('photo');
      const pickedFile = (photoInput.files && photoInput.files[0]) ? photoInput.files[0] : null;
      const photoFile = this.#capturedFile || pickedFile;

      if (!description) {
        this.showSubmitError(new Error('Deskripsi wajib diisi.'));
        return;
      }
      if (!photoFile) {
        this.showSubmitError(new Error('Foto wajib diisi.'));
        return;
      }
      if (photoFile.size > 1024 * 1024) {
        this.showSubmitError(new Error('Ukuran foto maksimal 1MB.'));
        return;
      }
      if (!asGuest && !token) {
        this.showSubmitError(new Error('Anda belum login. Aktifkan mode guest atau login dulu.'));
        location.hash = '#/login';
        return;
      }

      await this.#presenter.submitStory({ description, photoFile, lat, lon, asGuest });
    });
  }

  #initMap() {
    const mapEl = document.getElementById('map');
    mapEl.innerHTML = '';

    this.#map = L.map(mapEl, { center: [0.7893, 113.9213], zoom: 4 });
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.#map);
    const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    });
    L.control.layers({ 'OpenStreetMap': osm, 'Carto Light': carto }).addTo(this.#map);

    this.#map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const latInput = document.getElementById('lat');
      const lonInput = document.getElementById('lon');
      latInput.value = lat.toFixed(6);
      lonInput.value = lng.toFixed(6);

      if (this.#pickedMarker) this.#pickedMarker.remove();
      this.#pickedMarker = L.marker([lat, lng]).addTo(this.#map);
      this.#pickedMarker.bindPopup('Lokasi dipilih').openPopup();
    });
  }

  #initCamera() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const preview = document.getElementById('camera-preview');

    const openBtn = document.getElementById('open-camera');
    const captureBtn = document.getElementById('capture');
    const closeBtn = document.getElementById('close-camera');

    openBtn.addEventListener('click', async () => {
      try {
        this.clearFeedback();
        this.#mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = this.#mediaStream;
        video.hidden = false;
        await video.play();
      } catch (err) {
        this.showSubmitError(new Error('Tidak bisa membuka kamera. Pastikan izin kamera diberikan.'));
      }
    });

    captureBtn.addEventListener('click', async () => {
      if (!this.#mediaStream || video.hidden) return;

      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) return;

      this.#capturedFile = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      preview.src = URL.createObjectURL(blob);
      preview.hidden = false;
    });

    const stopStream = () => {
      if (!this.#mediaStream) return;
      this.#mediaStream.getTracks().forEach((t) => t.stop());
      this.#mediaStream = null;
    };

    closeBtn.addEventListener('click', () => {
      stopStream();
      video.pause();
      video.hidden = true;
      video.srcObject = null;
    });

    // Make sure stream is closed when leaving page (SPA)
    window.addEventListener('hashchange', stopStream, { once: true });
  }

  // View API for presenter
  clearFeedback() {
    const el = document.getElementById('form-feedback');
    if (el) el.innerHTML = '';
  }

  showSubmitting() {
    this.#isSubmitting = true;
    const btn = document.getElementById('submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Mengirim...';
    }
  }

  hideSubmitting() {
    this.#isSubmitting = false;
    const btn = document.getElementById('submit-btn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Kirim Story';
    }
  }

  showSuccess() {
    const el = document.getElementById('form-feedback');
    if (el) el.innerHTML = `<p class="success">Story berhasil dikirim.</p>`;
  }

  showSubmitError(err) {
    const el = document.getElementById('form-feedback');
    if (el) el.innerHTML = `<p class="error">${this.#escape(err.message)}</p>`;
  }

  resetForm() {
    const form = document.getElementById('story-form');
    if (form) form.reset();
    this.#capturedFile = null;
    const preview = document.getElementById('camera-preview');
    if (preview) {
      preview.hidden = true;
      preview.src = '';
    }
    if (this.#pickedMarker) {
      this.#pickedMarker.remove();
      this.#pickedMarker = null;
    }
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
