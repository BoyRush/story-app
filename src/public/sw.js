/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'dicoding-story-v1';
const APP_SHELL = [
  './',
  './index.html',
  './app.bundle.js',
  './app.css',
  './manifest.webmanifest',
  './favicon.png',
  './images/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'Notifikasi', options: { body: event.data?.text?.() || '' } };
  }

  const title = data.title || 'Dicoding Story';
  const options = {
    body: data.options?.body || 'Ada story baru.',
    icon: '/images/logo.png',
    badge: '/favicon.png',
    data: data.data || {}, // kita pakai untuk navigation
    actions: [
      { action: 'open_detail', title: 'Lihat detail' },
      { action: 'close', title: 'Tutup' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const storyId = event.notification.data?.storyId;

  // Default: buka app
  let url = '/#/';

  // Advanced: buka halaman detail
  if (action === 'open_detail' && storyId) {
    url = `/#/stories/${storyId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // fokus kalau sudah ada tab app
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
