import { getAllSavedStories, deleteStory } from '../../data/saved-story-store';

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const SavedPage = {
  async render() {
    return `
      <section class="container">
        <h1>Story Tersimpan</h1>

        <div class="form-group has-validation" style="margin: 12px 0;">
          <label for="saved-search">Cari story tersimpan</label>
          <input
            id="saved-search"
            type="text"
            class="form-control"
            placeholder="Cari berdasarkan nama/deskripsi..."
          />
        </div>

        <div id="saved-list" class="story-list"></div>
      </section>
    `;
  },

  async afterRender() {
    const listEl = document.getElementById('saved-list');
    const searchEl = document.getElementById('saved-search');

    const renderList = (items) => {
      if (!items.length) {
        listEl.innerHTML = `<p class="hint">Belum ada story yang disimpan.</p>`;
        return;
      }

      listEl.innerHTML = items.map((s) => `
        <article class="story-item">
          <img
            class="story-thumb"
            src="${s.photoUrl}"
            alt="Foto story dari ${escapeHtml(s.name)}"
            loading="lazy"
          />
          <div class="story-body">
            <h2 class="story-title">${escapeHtml(s.name)}</h2>
            <p class="story-desc">${escapeHtml(s.description)}</p>

            <div class="header-actions" style="gap:8px;">
              <a class="button secondary" href="#/stories/${s.id}">Lihat Detail</a>
              <button class="button" type="button" data-delete-id="${s.id}">
                Hapus
              </button>
            </div>
          </div>
        </article>
      `).join('');

      listEl.querySelectorAll('button[data-delete-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete-id');
          await deleteStory(id);
          const updated = await getAllSavedStories();
          applySearch(updated);
        });
      });
    };

    const applySearch = (items) => {
      const q = (searchEl.value || '').toLowerCase().trim();
      const filtered = !q
        ? items
        : items.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q),
          );

      renderList(filtered);
    };

    const all = await getAllSavedStories();
    renderList(all);

    searchEl.addEventListener('input', async () => {
      const latest = await getAllSavedStories();
      applySearch(latest);
    });
  },
};

export default SavedPage;
