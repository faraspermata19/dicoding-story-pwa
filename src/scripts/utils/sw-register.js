// src/scripts/utils/sw-register.js
import CONFIG from './config';
import { subscribePush, unsubscribePushAPI } from '../data/api';

// Perbaikan: Akses properti dari objek CONFIG yang diimpor, 
// tidak ada lagi named import dari './config'
const VAPID_PUBLIC_KEY = CONFIG.VAPID_PUBLIC_KEY;
const API_BASE_URL = CONFIG.API_BASE_URL; 

const swRegister = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in the browser');
    return null;
  }

  try {
    // Pastikan path ke service worker benar (sw.js di dist root)
    const registration = await navigator.serviceWorker.register('./sw.js'); // Ganti sw.bundle.js jika Anda ubah di webpack.common.js
    console.log('Service worker registered successfully', registration);
    return registration;
  } catch (error) {
    console.log('Failed to register service worker', error);
    return null;
  }
};

// --- Helper Functions ---

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Fungsi untuk berlangganan (digunakan oleh App.js dan diinisiasi di setupPushNotification)
const subscribePushNotification = async (registration) => {
  const loginResult = localStorage.getItem('loginResult');
  if (!loginResult) {
    // Menggunakan pesan konsol, bukan alert, agar tidak mengganggu UX.
    console.error('User not logged in, cannot subscribe.');
    return false;
  }

  // 1. Periksa dan minta izin notifikasi
  if (Notification.permission === 'denied') {
    // Harap dicatat: alert() akan diblokir di lingkungan iFrame.
    // Ganti ini dengan UI kustom jika Anda ingin feedback ke user!
    console.warn('Izin Notifikasi ditolak. Harap ubah di pengaturan browser Anda.');
    return false;
  } else if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;
  }

  try {
    // 2. Buat objek langganan Web Push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // 3. Kirim langganan ke API server
    const response = await subscribePush(subscription);
    const responseJson = await response.json();

    if (!responseJson.error) {
      console.log('Push subscription successfully sent to server.', responseJson);
      return true;
    } else {
      console.error('Failed to send push subscription to server:', responseJson.message);
      return false;
    }
  } catch (error) {
    console.error('Error during push subscription:', error);
    return false;
  }
};

// Fungsi untuk berhenti langganan
const unsubscribePushNotification = async (registration) => {
  const loginResult = localStorage.getItem('loginResult');
  if (!loginResult) return false;

  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      // 1. Hapus dari server
      await unsubscribePushAPI(subscription.endpoint);
      
      // 2. Hapus dari browser
      const successfulUnsub = await subscription.unsubscribe();
      if (successfulUnsub) {
        console.log('Push unsubscribed successfully locally and from server.');
        return true;
      }
    }
    console.log('Not subscribed to push notifications.');
    return false;
  } catch (error) {
    console.error('Error unsubscribing push notification:', error);
    return false;
  }
};

const isPushSubscribed = async (registration) => {
  if (!('PushManager' in window)) return false;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
};

export { 
    swRegister, 
    subscribePushNotification, 
    unsubscribePushNotification, 
    isPushSubscribed 
};