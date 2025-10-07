// src/scripts/data/api.js
import CONFIG from '../utils/config';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('loginResult') ? JSON.parse(localStorage.getItem('loginResult')).token : null;
  
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    // Hapus Content-Type header jika method POST dan body adalah FormData, 
    // agar browser bisa otomatis set boundary multipart
    if (options.method === 'POST' && options.body instanceof FormData) {
        delete options.headers['Content-Type'];
    }
  }
  
  return fetch(url, options);
}

// Tambahkan kembali fungsi userRegister dan userLogin dengan export yang benar.
// INI BAGIAN YANG DIPERBAIKI DARI KOMENTAR Anda
export async function userRegister({ name, email, password }) {
  return fetch(`${CONFIG.API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function userLogin({ email, password }) {
  return fetch(`${CONFIG.API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}
// AKHIR BAGIAN PERBAIKAN

export async function getAllStories() {
  const storiesUrl = `${CONFIG.API_BASE_URL}/stories?location=1`;
  return fetchWithAuth(storiesUrl);
}

// BARU: Fungsi untuk mendapatkan detail cerita
export async function getDetailStory(id) {
    const detailUrl = `${CONFIG.API_BASE_URL}/stories/${id}`;
    return fetchWithAuth(detailUrl);
}

export async function addNewStory({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);

  // Pastikan tidak mengirim string kosong sebagai lat/lon jika tidak ada data
  if (lat && lon && lat !== 'undefined' && lon !== 'undefined') {
    formData.append('lat', lat);
    formData.append('lon', lon);
  }

  const storiesUrl = `${CONFIG.API_BASE_URL}/stories`;
  return fetchWithAuth(storiesUrl, {
    method: 'POST',
    body: formData,
  });
}

// BARU: Fungsi untuk mendaftar dan berhenti langganan push (digunakan di sw-register)
export async function subscribePush(subscription) {
    const token = localStorage.getItem('loginResult') ? JSON.parse(localStorage.getItem('loginResult')).token : null;
    if (!token) throw new Error('User not logged in');

    // **PERBAIKAN: Memfilter objek subscription**
    // Kita ambil endpoint dan keys dari objek subscription yang lengkap
    const filteredSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys, // Mengambil p256dh dan auth
    };
    
    return fetch(`${CONFIG.API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        // Mengirim objek yang sudah difilter
        body: JSON.stringify(filteredSubscription), 
    });
}

export async function unsubscribePushAPI(endpoint) {
    const token = localStorage.getItem('loginResult') ? JSON.parse(localStorage.getItem('loginResult')).token : null;
    if (!token) throw new Error('User not logged in');

    return fetch(`${CONFIG.API_BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint }),
    });
}