// src/scripts/data/db.js
import { openDB } from 'idb';

const DATABASE_NAME = 'dicoding-story-db';
const DATABASE_VERSION = 1;
const STORY_FAVORITES_STORE_NAME = 'story-favorites'; // Untuk Like/Unlike
const STORY_SYNC_STORE_NAME = 'story-sync'; // Untuk Background Sync

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    // Store untuk cerita favorit (Kriteria 4: Basic)
    if (!database.objectStoreNames.contains(STORY_FAVORITES_STORE_NAME)) {
      database.createObjectStore(STORY_FAVORITES_STORE_NAME, { keyPath: 'id' });
    }
    // Store untuk data yang menunggu sinkronisasi (Kriteria 4: Advanced)
    if (!database.objectStoreNames.contains(STORY_SYNC_STORE_NAME)) {
      database.createObjectStore(STORY_SYNC_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  },
});

export {
  dbPromise,
  STORY_FAVORITES_STORE_NAME,
  STORY_SYNC_STORE_NAME,
};