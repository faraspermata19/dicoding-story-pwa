// src/scripts/pages/about/about-page.js
export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>Tentang Aplikasi Kami</h1>
        <p>Aplikasi ini adalah sebuah katalog film interaktif yang dirancang untuk memenuhi kriteria submission pada kelas "Menjadi Web Developer Expert".</p>
        <p>Dibangun dengan arsitektur Single-Page Application (SPA), aplikasi ini menggunakan Webpack untuk bundling dan pure JavaScript untuk interaktivitas.</p>
        <h2>Fitur-fitur Utama:</h2>
        <ul>
          <li>Menampilkan daftar film populer dari TMDB API.</li>
          <li>Halaman detail film dengan informasi lengkap.</li>
          <li>Peta interaktif menggunakan Leaflet.js untuk menandai lokasi.</li>
          <li>Fitur tambah film baru (simulasi).</li>
          <li>Dirancang dengan aksesibilitas dan responsivitas.</li>
        </ul>
      </section>
    `;
  }

  async afterRender() {
    // Logika tambahan jika diperlukan setelah halaman dirender
  }
}