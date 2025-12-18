// CSS imports
import '../styles/styles.css';

import App from './pages/app';

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  await navigator.serviceWorker.register('/sw.js');
}

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();
  // Skip to content (A11y)
  // Prevent interfering with SPA hash routing by moving focus programmatically
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a.skip-to');
    if (!link) return;
    e.preventDefault();

    const main = document.querySelector('#main-content');
    if (!main) return;
    main.focus();
    main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
