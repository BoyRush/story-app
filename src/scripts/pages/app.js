import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { clearAuthToken, isLoggedIn } from '../data/auth-store';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const pageFactory = routes[url];

    if (!pageFactory) {
      this.#content.innerHTML = '<section class="container"><h1>404</h1><p>Halaman tidak ditemukan.</p></section>';
      return;
    }

    const page = pageFactory();

    // Update <title> for screen reader (A11y)
    this._setDocumentTitle(url);

    // Update navigation based on auth state
    this._renderNav();

    const updateDOM = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    };

    // View Transition API (with fallback) - Kriteria 1
    if (document.startViewTransition) {
      document.startViewTransition(() => updateDOM());
    } else {
      await updateDOM();
    }
  }

  _setDocumentTitle(route) {
    const map = {
      '/': 'Beranda - Dicoding Story',
      '/add': 'Tambah Story - Dicoding Story',
      '/login': 'Login - Dicoding Story',
      '/register': 'Register - Dicoding Story',
      '/saved': 'Story Tersimpan - Dicoding Story',
      '/about': 'About - Dicoding Story',
      '/stories/:id': 'Detail Story - Dicoding Story',
    };
    document.title = map[route] || 'Dicoding Story';
  }

  _renderNav() {
    const navList = document.querySelector('#nav-list');
    if (!navList) return;

    navList.innerHTML = isLoggedIn()
      ? `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/add">Tambah Story</a></li>
        <li><a href="#/about">About</a></li>
        <li><a href="#/saved">Tersimpan</a></li>
        <li><button class="linklike" id="logout-btn" type="button">Logout</button></li>
      `
      : `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
        <li><a href="#/about">About</a></li>
      `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearAuthToken();
        location.hash = '#/login';
      });
    }
  }
}

export default App;
