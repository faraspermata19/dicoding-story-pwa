// src/scripts/sw.js
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// CONFIG dan OfflineSyncHelper akan di-bundle oleh Webpack
import CONFIG from './utils/config';
import OfflineSyncHelper from './utils/offline-sync-helper';

const API_BASE_URL = CONFIG.API_BASE_URL;

// [✅ KRITIS: Fallback URL]
// Kita tetapkan index.html sebagai fallback page
const FALLBACK_HTML_URL = 'index.html'; 

// ===== Precaching =====
precacheAndRoute([
  ...self.__WB_MANIFEST, 
  { url: FALLBACK_HTML_URL, revision: null }, 
    { url: 'favicon.png', revision: null },
    { url: 'manifest.json', revision: null },
    { url: 'icon-192x192.png', revision: null },
    { url: 'icon-512x512.png', revision: null },
    { url: 'icon-96x96.png', revision: null },
    { url: 'icon-144x144.png', revision: null }, // Tambahkan index.html eksplisit sebagai fallback
]);


// [✅ PERBAIKAN KRITIS: Network Fallback untuk Navigasi SPA]
// Rute ini menangani permintaan navigasi (saat user mengubah URL atau me-refresh halaman)
registerRoute(
    ({ request }) => request.mode === 'navigate', // Tangkap semua navigasi
    createHandlerBoundToURL(FALLBACK_HTML_URL) // Selalu sajikan index.html dari precache
);

// ===== Cache API (Dynamic) =====
registerRoute(
  ({ url }) => url.href.startsWith(`${API_BASE_URL}/stories`),
  new StaleWhileRevalidate({
    cacheName: 'dicoding-story-api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

// ===== Cache Gambar =====
registerRoute(
  ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/images/'),
  new CacheFirst({
    cacheName: 'dicoding-story-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// ===== Push Notification =====
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data.json(); }
  catch (e) { data = { title: 'Push Notification', options: { body: event.data.text() } }; }

  const storyId = data.storyId || null;
  const title = data.title || 'Notifikasi Cerita';
  const options = {
    body: data.options?.body || 'Anda memiliki notifikasi baru.',
    icon: 'icon-192x192.png',
    badge: 'icon-96x96.png',
    data: { url: storyId ? `/#/stories/${storyId}` : '/#/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ===== Notification click =====
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// ===== Background Sync =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-story') {
    event.waitUntil(OfflineSyncHelper.syncPendingStories());
  }
});
