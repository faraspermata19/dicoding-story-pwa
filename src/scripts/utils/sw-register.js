import CONFIG from './config';
import { subscribePush, unsubscribePushAPI } from '../data/api';

const VAPID_PUBLIC_KEY = CONFIG.VAPID_PUBLIC_KEY;
const API_BASE_URL = CONFIG.API_BASE_URL;

// [✅ PERBAIKAN FINAL PADA LOGIKA DETEKSI LOKAL]
const DEPLOY_PATH = '/dicoding-story-pwa/';
const HOSTNAME = window.location.hostname;

// Logika: Jika hostname BUKAN IP publik (atau bukan path deployment), maka anggap itu lokal (root '/').
// Di lingkungan lokal (localhost, 127.0.0.1, atau 192.x.x.x), kita selalu ingin scope '/'
const IS_LOCAL = HOSTNAME === 'localhost' || HOSTNAME === '127.0.0.1' || HOSTNAME.startsWith('192.') || HOSTNAME.startsWith('172.') || HOSTNAME.startsWith('10.');

// Tentukan PUBLIC_URL_PATH berdasarkan deteksi.
const PUBLIC_URL_PATH = IS_LOCAL ? '/' : DEPLOY_PATH;


const swRegister = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in the browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      `${PUBLIC_URL_PATH}sw.js`,
      { scope: PUBLIC_URL_PATH }
    );
    console.log('Service worker registered successfully', registration);
    return registration;
  } catch (error) {
    console.error('Failed to register service worker', error);
    return null;
  }
};

// Helper untuk Push Notification
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};

const subscribePushNotification = async (registration) => {
  if (!registration) return false;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    const response = await subscribePush(subscription);
    const responseJson = await response.json();
    return !responseJson.error;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const unsubscribePushNotification = async (registration) => {
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await unsubscribePushAPI(subscription.endpoint);
    return subscription.unsubscribe();
  }
  return false;
};

const isPushSubscribed = async (registration) => {
  if (!('PushManager' in window)) return false;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
};

export { swRegister, subscribePushNotification, unsubscribePushNotification, isPushSubscribed };
