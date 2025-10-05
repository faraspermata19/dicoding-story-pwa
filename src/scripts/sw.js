// src/scripts/sw.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import CONFIG from './utils/config'; // Perbaikan: Import seluruh objek CONFIG sebagai default
import OfflineSyncHelper from './utils/offline-sync-helper'; // Import helper sync

const API_BASE_URL = CONFIG.API_BASE_URL; // Akses properti dari objek CONFIG

// Precaching App Shell
precacheAndRoute(self.__WB_MANIFEST);

// Cache API Dynamic Content (Kriteria 3: Advanced)
registerRoute(
  // Ambil request API stories (termasuk detail, karena ada id-nya)
  ({ url }) => url.href.startsWith(`${API_BASE_URL}/stories`),
  new StaleWhileRevalidate({
    cacheName: 'dicoding-story-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // Cache selama 7 hari
      }),
    ],
  }),
);

// Cache gambar dari API (misalnya photoUrl)
registerRoute(
  ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/images/'),
  new CacheFirst({
    cacheName: 'dicoding-story-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100, 
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache selama 30 hari
      }),
    ],
  }),
);

// --- Push Notification Handlers (Kriteria 2: Advanced) ---

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const storyId = data.storyId || null; // Diharapkan dikirim dari server
  
  const title = data.title || 'Notifikasi Cerita';
  const options = {
    body: data.options.body || 'Anda memiliki notifikasi baru.',
    icon: 'icon-192x192.png',
    badge: 'icon-96x96.png',
    data: {
      url: storyId ? `/#/stories/${storyId}` : '/#/', // Target navigasi
    },
  };
  
  // Tampilkan notifikasi dinamis
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  const clickedNotification = event.notification;
  clickedNotification.close();

  const promiseChain = clients.openWindow(clickedNotification.data.url); // Navigasi Action
  event.waitUntil(promiseChain);
});

// --- Background Sync Handlers (Kriteria 4: Advanced) ---

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-story') {
    // Jalankan logika sinkronisasi saat koneksi kembali
    event.waitUntil(OfflineSyncHelper.syncPendingStories()); 
  }
});