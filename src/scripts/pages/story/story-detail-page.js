import StoryModel from '../../models/story-model';
import StoryDetailPresenter from '../../presenters/story-detail-presenter';
import { getAuthToken } from '../../data/auth-store';
import { parseActivePathname } from '../../routes/url-parser';
import { showFormattedDate } from '../../utils/index';
import { saveStory, deleteStory, isStorySaved } from '../../data/saved-story-store';

export default class StoryDetailPage {
  #presenter;

  async render() {
    return `
      <section class="container narrow">
        <a class="link" href="#/">← Kembali</a>
        <div id="detail-feedback" class="feedback" aria-live="polite"></div>
        <div id="detail-loading" class="loading">Memuat detail story...</div>
        <article id="detail" class="story-detail" hidden></article>
      </section>
    `;
  }

  async afterRender() {
    const token = getAuthToken();
    if (!token) {
      location.hash = '#/login';
      return;
    }

    const { id } = parseActivePathname();
    if (!id) {
      this.showError(new Error('ID story tidak ditemukan pada URL.'));
      return;
    }

    this.#presenter = new StoryDetailPresenter({ model: new StoryModel(), view: this, token });
    await this.#presenter.loadDetail(id);
  }

  showLoading() {
    const el = document.getElementById('detail-loading');
    if (el) el.hidden = false;
  }

  showError(err) {
    const loading = document.getElementById('detail-loading');
    if (loading) loading.hidden = true;
    const feedback = document.getElementById('detail-feedback');
    if (feedback) feedback.innerHTML = `<p class="error">${this.#escape(err.message)}</p>`;
  }

  async renderStory(story) {
    const loading = document.getElementById('detail-loading');
    if (loading) loading.hidden = true;

    const el = document.getElementById('detail');
    if (!el) return;

    const created = showFormattedDate(story.createdAt, 'id-ID');

    const saved = await isStorySaved(story.id);

    el.hidden = false;
    el.innerHTML = `
      <h1 class="story-title">${this.#escape(story.name)}</h1>
      <p class="story-date">${created}</p>
      <img class="story-hero" src="${story.photoUrl}" alt="Foto story oleh ${this.#escape(story.name)}" />
      <p class="story-desc">${this.#escape(story.description)}</p>

      <div class="header-actions">
        <button class="button secondary" type="button" id="save-btn">
          ${saved ? 'Hapus dari Tersimpan' : 'Simpan ke Tersimpan'}
        </button>
      </div>
    `;

    const btn = document.getElementById('save-btn');
    btn.addEventListener('click', async () => {
      const currentlySaved = await isStorySaved(story.id);
      if (currentlySaved) {
        await deleteStory(story.id);
        btn.textContent = 'Simpan ke Tersimpan';
      } else {
        await saveStory(story);
        btn.textContent = 'Hapus dari Tersimpan';
      }
    });
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
