// src/scripts/pages/favorite/favorite-page.js
import IdbHelper from '../../utils/idb-helper';

export default class FavoritePage {
  async render() {
    return `
      <section class="container">
        <h1>Cerita Favorit Saya</h1>
        <div id="favorite-story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyListContainer = document.querySelector('#favorite-story-list');
    storyListContainer.innerHTML = '<p>Memuat cerita favorit...</p>';
    
    try {
      // Mengambil semua cerita dari IndexedDB
      const stories = await IdbHelper.getAllStories();
      
      if (stories && stories.length > 0) {
        // Render daftar cerita ke DOM (mirip dengan home-page.js)
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
      } else {
        storyListContainer.innerHTML = '<p>Anda belum menambahkan cerita ke favorit.</p>';
      }
    } catch (error) {
      console.error('Gagal memuat cerita favorit:', error);
      storyListContainer.innerHTML = '<p>Terjadi kesalahan saat memuat daftar favorit.</p>';
    }
  }
}