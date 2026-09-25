// Публичная конфигурация веб-приложения Firebase (не секрет — доступ защищают правила Firestore).
export const firebaseConfig = {
  apiKey: 'AIzaSyBdtciA1ZzjdT1-5cH9bVnBC_NQLvaBHrU',
  authDomain: 'sultanplaza.firebaseapp.com',
  projectId: 'sultanplaza',
  storageBucket: 'sultanplaza.firebasestorage.app',
  messagingSenderId: '306909596934',
  appId: '1:306909596934:web:43cadd19098ef33af3e287',
};

// Необязательно: собственный VAPID-ключ (Firebase Console → Project settings → Cloud Messaging →
// Web Push certificates). Если пусто — используется стандартный ключ Firebase.
export const FCM_VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';

export const APP_NAME = 'Sultan Plaza — Заказы';
export const APP_VERSION = __APP_VERSION__;
export const BUILD_TIME = __BUILD_TIME__;

// Сколько последних заказов хранится в базе: более старые удаляет Cloud Function
// (то же число — MAX_STORED_ORDERS в functions/index.js)
export const MAX_STORED_ORDERS = 50;
// Сколько последних заказов держим в живой ленте
export const LIVE_ORDERS_LIMIT = 250;
// Через сколько минут новый заказ считается «просроченным» (подсветка)
export const NEW_ORDER_WARN_MINUTES = 5;
// Интервал повтора звукового сигнала, пока есть непринятые заказы
export const ALERT_REPEAT_SECONDS = 20;
