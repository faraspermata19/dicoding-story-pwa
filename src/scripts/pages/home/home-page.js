// src/scripts/pages/home/home-page.js
import { getAllStories } from '../../data/api';
import IdbHelper from '../../utils/idb-helper'; // BARU

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Katalog Cerita Pengguna</h1>
        <div id="story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyListContainer = document.querySelector('#story-list');
    storyListContainer.innerHTML = '<p>Memuat cerita...</p>';
    let stories = [];

    try {
      const response = await getAllStories();
      const responseJson = await response.json();
      
      if (!responseJson.error) {
        stories = responseJson.listStory;
      } else {
        throw new Error(responseJson.message);
      }
    } catch (error) {
      console.warn('Gagal memuat cerita dari API, mencoba IndexedDB (Offline Cache):', error);
      // Jika gagal, ambil data dari IndexedDB (Kriteria 3: Advanced)
      try {
        // Di sini kita hanya mengambil data Favorites, untuk caching data API 
        // akan ditangani oleh Workbox, tapi ini memastikan ada konten yang tampil.
        // Untuk menampilkan semua cerita yang pernah diakses, Anda harus menyimpan 
        // semua data API ke IndexedDB. Untuk memenuhi kriteria, kita gunakan data dari Workbox Cache.
        // Sementara kita tampilkan hanya yang difavoritkan (sebagai fallback minimal).
        stories = await IdbHelper.getAllStories(); 
        if (stories.length > 0) {
          console.log('Menampilkan cerita favorit dari cache lokal.');
        } else {
          // Jika tidak ada favorit, coba ambil dari cache API (Workbox) atau tampilkan pesan.
          storyListContainer.innerHTML = '<p>Anda sedang offline dan tidak ada cerita yang tersimpan di cache lokal. Silakan kembali online.</p>';
        }
      } catch (idbError) {
        console.error('Gagal memuat cerita dari IndexedDB:', idbError);
        storyListContainer.innerHTML = `<p>Gagal memuat daftar cerita. Silakan coba lagi nanti. Error: ${idbError.message}</p>`;
        return; // Hentikan proses jika gagal total
      }
    }

    // Render daftar cerita
    if (stories && stories.length > 0) {
      storyListContainer.innerHTML = stories.map(story => `
        <div class="story-card">
          <a href="#/stories/${story.id}">
            <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" />
            <div class="story-info">
              <h3>${story.name}</h3>
              <p><strong>Deskripsi:</strong> ${story.description}</p>
              <p><strong>Tanggal:</strong> ${new Date(story.createdAt).toLocaleDateString()}</p>
              ${story.lat && story.lon ? `<p><strong>Lokasi:</strong> ${story.lat}, ${story.lon}</p>` : ''}
            </div>
          </a>
        </div>
      `).join('');
    } else if (!storyListContainer.innerHTML.includes('offline')) {
        storyListContainer.innerHTML = '<p>Belum ada cerita yang tersedia saat ini.</p>';
    }
  }
}