// src/scripts/utils/offline-sync-helper.js
import { dbPromise, STORY_SYNC_STORE_NAME } from '../data/db';
import { addNewStory } from '../data/api';
import { showFormattedDate } from './date-and-sleep'; // Import untuk log

const OfflineSyncHelper = {
  async addPendingStory({ description, photo, lat, lon }) {
    const db = await dbPromise;
    const tx = db.transaction(STORY_SYNC_STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORY_SYNC_STORE_NAME);
    
    // Simpan data cerita yang akan disinkronkan. 
    // Kita simpan file itu sendiri sebagai Blob di IndexedDB agar bisa dikirim nanti.
    // Kita juga tambahkan metadata seperti createdAt dan isSynced
    await store.add({
      description,
      photo: photo, // Menyimpan objek File/Blob
      lat, 
      lon,
      name: 'Draft (Offline)',
      createdAt: new Date().toISOString(),
    });
    await tx.done;

    console.log('Story saved locally for synchronization.');

    // Minta Service Worker untuk mencoba sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const swReg = await navigator.serviceWorker.ready;
      try {
        // Daftarkan sync tag, SW akan memicu ini saat online
        await swReg.sync.register('sync-new-story');
        console.log('Background sync registered: sync-new-story');
      } catch (e) {
        console.error('Background sync registration failed:', e);
      }
    } else {
      console.log('Background Sync not supported. Will retry on next online session.');
    }
  },
  
  async syncPendingStories() {
    const db = await dbPromise;
    const allPending = await db.getAll(STORY_SYNC_STORE_NAME);
    
    if (allPending.length === 0) {
      console.log('No pending stories to sync.');
      return;
    }

    console.log(`Attempting to sync ${allPending.length} pending stories...`);
    
    // Loop dan kirim setiap cerita yang tertunda
    for (const pendingStory of allPending) {
        try {
            // Panggil API untuk mengirim cerita baru
            const response = await addNewStory({ 
                description: pendingStory.description, 
                photo: pendingStory.photo, // Kirim objek File/Blob yang disimpan
                lat: pendingStory.lat, 
                lon: pendingStory.lon 
            }); 
            
            const responseJson = await response.json();

            if (!responseJson.error) {
                console.log(`Story synced successfully. Deleting local record: ${pendingStory.id}`);
                // Hapus dari IndexedDB setelah berhasil terkirim
                await db.delete(STORY_SYNC_STORE_NAME, pendingStory.id);
            } else {
                console.error(`Failed to sync story ${pendingStory.id}: ${responseJson.message}`);
                // Biarkan di IndexedDB untuk dicoba lagi
            }
        } catch (error) {
            console.error(`Error syncing story ${pendingStory.id}: Network/API error. Will retry later.`, error);
            // Error ini akan di-catch oleh SW dan dicoba lagi (auto-retry Background Sync)
        }
    }

    console.log('Finished trying to sync pending stories.');
  }
};

export default OfflineSyncHelper;