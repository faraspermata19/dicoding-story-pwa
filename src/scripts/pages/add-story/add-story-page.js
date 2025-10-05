// src/scripts/pages/add-story/add-story-page.js
import L from 'leaflet';
import 'leaflet-extra-markers'; // Import library untuk marker kustom
import { addNewStory } from '../../data/api';
import OfflineSyncHelper from '../../utils/offline-sync-helper';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container">
        <h1>Tambahkan Cerita Baru</h1>
        <form id="add-story-form">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" required></textarea>
          </div>
          <div class="form-group">
            <label for="photo">Foto</label>
            <input type="file" id="photo" name="photo" accept="image/*" required>
          </div>
          <div class="form-group">
            <label>Lokasi Cerita (Opsional)</label>
            <div id="map-form-container"></div>
            <input type="hidden" id="latitude" name="lat">
            <input type="hidden" id="longitude" name="lon">
          </div>
          <button type="submit">Tambah Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // Inisialisasi peta di formulir
    const map = L.map('map-form-container').setView([-6.200000, 106.816666], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let marker;
    
    // Buat ikon kustom yang sama dengan halaman detail
    const redIcon = L.ExtraMarkers.icon({
        icon: 'fa-star',
        markerColor: 'red',
        shape: 'circle',
        prefix: 'fa'
    });

    // Tangkap koordinat saat peta diklik
    map.on('click', (e) => {
      if (marker) {
        map.removeLayer(marker);
      }
      marker = L.marker(e.latlng, { icon: redIcon }).addTo(map); // Gunakan ikon kustom di sini
      document.getElementById('latitude').value = e.latlng.lat;
      document.getElementById('longitude').value = e.latlng.lng;
      alert(`Lokasi dipilih: ${e.latlng.lat}, ${e.latlng.lng}`);
    });

    const form = document.querySelector('#add-story-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const description = form.querySelector('#description').value;
      const photo = form.querySelector('#photo').files[0];
      const lat = form.querySelector('#latitude').value;
      const lon = form.querySelector('#longitude').value;
      
      const loginResult = JSON.parse(localStorage.getItem('loginResult'));
      if (!loginResult || !loginResult.token) {
        alert('Anda harus login terlebih dahulu.');
        return;
      }

      try {
        if (!navigator.onLine) {
          // Jika offline, simpan ke IndexedDB untuk Background Sync (Kriteria 4: Advanced)
          await OfflineSyncHelper.addPendingStory({ description, photo, lat, lon });
          alert('Anda sedang offline. Cerita disimpan dan akan dikirim otomatis saat koneksi kembali.');
          window.location.hash = '#/';
          return;
        }

        // Jika online, kirim langsung ke API
        const response = await addNewStory({ description, photo, lat, lon });
        const responseJson = await response.json();

        if (!responseJson.error) {
          alert('Cerita berhasil ditambahkan!');
          window.location.hash = '#/';
        } else {
          alert(responseJson.message);
        }
      } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan saat menambahkan cerita. Coba lagi atau pastikan koneksi Anda stabil.');
      }
    });
  }
}