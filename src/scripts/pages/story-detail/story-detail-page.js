// src/scripts/pages/story-detail/story-detail-page.js
import L from 'leaflet';
import 'leaflet-extra-markers';
import { getDetailStory } from '../../data/api'; // Menggunakan endpoint detail
import { parseActivePathname } from '../../routes/url-parser';
import IdbHelper from '../../utils/idb-helper'; // Import helper IndexedDB

export default class StoryDetailPage {
  #story = null;

  async render() {
    const urlParams = parseActivePathname();
    const storyId = urlParams.id;

    if (!storyId) {
      return '<div class="container">ID Cerita tidak ditemukan.</div>';
    }

    try {
      // Coba ambil detail dari API
      const storyResponse = await getDetailStory(storyId);
      const storyData = await storyResponse.json();
      this.#story = storyData.story;
    } catch(error) {
      console.warn('Gagal fetch detail API, mencoba IndexedDB:', error);
      // Fallback ke IndexedDB (Kriteria 3: Advanced / Cache Fallback)
      this.#story = await IdbHelper.getStory(storyId);
    }
    
    if (!this.#story) {
      return '<div class="container">Cerita tidak ditemukan. Pastikan Anda online atau cerita sudah difavoritkan.</div>';
    }

    const isLiked = await IdbHelper.getStory(storyId);
    const likeButtonIcon = isLiked ? '❤️' : '🤍'; // Ikon hati

    return `
      <section class="container story-detail-page">
        <img class="story-photo" src="${this.#story.photoUrl}" alt="Foto cerita dari ${this.#story.name}" />
        <div class="story-info">
          <h1>${this.#story.name}</h1>
          <p><strong>Deskripsi:</strong> ${this.#story.description}</p>
          <p><strong>Tanggal:</strong> ${new Date(this.#story.createdAt).toLocaleDateString()}</p>
          
          <button id="like-button" class="like-button" aria-label="${isLiked ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}">
            ${likeButtonIcon} Favorit
          </button>
          
          ${this.#story.lat && this.#story.lon ? `
            <div class="story-map-section">
              <h2>Lokasi Cerita</h2>
              <div id="map-container"></div>
            </div>
          ` : '<p>Tidak ada data lokasi untuk cerita ini.</p>'}
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (!this.#story || !this.#story.lat || !this.#story.lon) return;

    // ... (Logika peta - tetap sama)

    // Logic Like/Unlike Button
    const likeButton = document.getElementById('like-button');
    if (likeButton) {
      likeButton.addEventListener('click', async () => {
        const isLiked = await IdbHelper.getStory(this.#story.id);

        if (isLiked) {
          await IdbHelper.deleteStory(this.#story.id);
          alert('Cerita dihapus dari favorit.');
        } else {
          // Hanya simpan data yang diperlukan di IndexedDB
          await IdbHelper.putStory(this.#story); 
          alert('Cerita ditambahkan ke favorit.');
        }

        // Render ulang halaman untuk memperbarui tombol
        window.location.reload(); 
      });
    }
  }
}