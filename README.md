# Proyek Submission: Katalog Film Interaktif
Proyek ini adalah aplikasi web satu halaman (Single-Page Application) yang berfungsi sebagai katalog film interaktif. Aplikasi ini dirancang untuk memenuhi kriteria submission pada kelas "Menjadi Web Developer Expert".

# Fitur Utama
Katalog Film Populer: Menampilkan daftar film populer yang diambil dari TMDB API.

Halaman Detail Film: Menyajikan informasi lengkap tentang setiap film.

Peta Interaktif: Menggunakan Leaflet.js dan data dari OpenStreetMap untuk menampilkan lokasi syuting (simulasi) dan memiliki fitur multiple tile layer.

Fitur Tambah Film (Simulasi): Menyediakan formulir untuk menambah data film baru, yang menunjukkan pemahaman tentang alur kerja pengiriman data.

Aksesibilitas: Menerapkan praktik aksesibilitas web, termasuk tautan "Lewati ke konten utama" dan dukungan interaksi keyboard.

# Teknologi yang Digunakan
HTML, CSS, dan JavaScript (ES6+): Dasar dari seluruh aplikasi.

Webpack: Untuk proses bundling dan optimasi aset.

Leaflet.js: Pustaka JavaScript ringan untuk peta interaktif.

OpenStreetMap: Penyedia data peta gratis.

TMDB API: Sumber data untuk film.

# Memulai Prasyarat Pastikan Anda memiliki:

Node.js (disarankan versi 12 atau lebih tinggi).

npm (Node package manager).

# Instalasi dan Menjalankan Proyek Pasang semua dependensi yang diperlukan:

Shell
npm install
# Jalankan server pengembangan:
Shell
npm run start-dev
(Catatan: Jika port 9000 sudah terpakai, proyek akan berjalan di port 8000 seperti yang dijelaskan di file STUDENT.txt.)

# Aplikasi akan tersedia 
di http://localhost:8000 atau port lain yang tersedia.

# Struktur Proyek
Struktur proyek ini telah dimodifikasi untuk mengadopsi arsitektur MVP (Model-View-Presenter) agar kode lebih modular dan mudah diatur.

# Plaintext
starter-project/
├── dist/                     # Hasil build untuk produksi
├── src/                      # Berkas sumber
│   ├── public/               # Gambar dan favicon
│   ├── scripts/
│   │   ├── data/
│   │   │   └── api.js        # Modul untuk interaksi dengan TMDB API
│   │   ├── pages/
│   │   │   ├── about/
│   │   │   ├── add-film/     # Halaman untuk menambah film baru (simulasi)
│   │   │   ├── film-detail/  # Halaman detail film
│   │   │   └── home/
│   │   ├── routes/
│   │   │   └── ...           # Konfigurasi routing
│   │   └── utils/
│   │       └── ...           # Fungsi utilitas
│   ├── styles/
│   │   └── styles.css        # Berkas CSS utama
│   └── index.html            # Berkas HTML utama
├── package.json              # Metadata dan dependensi proyek
├── README.md                 # Dokumentasi proyek ini
└── STUDENT.txt               # Informasi penting untuk reviewer

# App Starter Project with Webpack

Proyek ini adalah setup dasar untuk aplikasi web yang menggunakan webpack untuk proses bundling, Babel untuk transpile JavaScript, serta mendukung proses build dan serving aplikasi.

## Table of Contents

- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (disarankan versi 12 atau lebih tinggi)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Download starter project [di sini](https://raw.githubusercontent.com/dicodingacademy/a219-web-intermediate-labs/099-shared-files/starter-project-with-webpack.zip).
2. Lakukan unzip file.
3. Pasang seluruh dependencies dengan perintah berikut.
   ```shell
   npm install
   ```

## Scripts

- Build for Production:
  ```shell
  npm run build
  ```
  Script ini menjalankan webpack dalam mode production menggunakan konfigurasi `webpack.prod.js` dan menghasilkan sejumlah file build ke direktori `dist`.

- Start Development Server:
  ```shell
  npm run start-dev
  ```
  Script ini menjalankan server pengembangan webpack dengan fitur live reload dan mode development sesuai konfigurasi di`webpack.dev.js`.

- Serve:
  ```shell
  npm run serve
  ```
  Script ini menggunakan [`http-server`](https://www.npmjs.com/package/http-server) untuk menyajikan konten dari direktori `dist`.

## Project Structure

Proyek starter ini dirancang agar kode tetap modular dan terorganisir.

```text
starter-project/
├── dist/                   # Compiled files for production
├── src/                    # Source project files
│   ├── public/             # Public files
│   ├── scripts/            # Source JavaScript files
│   │   └── index.js        # Main JavaScript entry file
│   ├── styles/             # Source CSS files
│   │   └── styles.css      # Main CSS file
│   └── index.html/         # Main HTML file
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Project metadata and dependencies
├── README.md               # Project documentation
├── STUDENT.txt             # Student information
├── webpack.common.js       # Webpack common configuration
├── webpack.dev.js          # Webpack development configuration
└── webpack.prod.js         # Webpack production configuration
```
