// Отправка заказов из QR-меню в Firebase Firestore.
// Заказ сразу появляется в админ-панели (qradminsite) и приходит push-уведомлением персоналу.
// Используется облегчённый Firestore Lite (без realtime) — быстро грузится на телефоне гостя.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  getFirestore,
  doc,
  runTransaction,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore-lite.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBdtciA1ZzjdT1-5cH9bVnBC_NQLvaBHrU',
  authDomain: 'sultanplaza.firebaseapp.com',
  projectId: 'sultanplaza',
  storageBucket: 'sultanplaza.firebasestorage.app',
  messagingSenderId: '306909596934',
  appId: '1:306909596934:web:43cadd19098ef33af3e287'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PAYMENTS = ['KASPI', 'JUSAN', 'HALYK', 'CASH', 'NONE'];
const LANGS = ['ru', 'kk', 'en'];
const clip = (v, max) => String(v ?? '').trim().slice(0, max);
const int = (v, min, max) => Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

/**
 * Создаёт заказ с порядковым номером (№1, №2, …).
 * Номер выдаётся атомарно: счётчик counters/orders и заказ пишутся одной транзакцией.
 * @returns {Promise<{ number: number }>}
 */
export async function submitOrder(input) {
  const items = (Array.isArray(input.items) ? input.items : [])
    .filter((i) => i && Number(i.qty) > 0)
    .slice(0, 100)
    .map((i) => ({
      name: clip(i.name, 120),
      category: clip(i.category, 80),
      price: int(i.price, 0, 10_000_000),
      qty: int(i.qty, 1, 99)
    }));
  if (!items.length) throw new Error('Корзина пуста');

  const serviceRate = Math.min(1, Math.max(0, Number(input.serviceRate) || 0));
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const serviceFee = Math.round(subtotal * serviceRate); // та же формула, что в menu.js
  const order = {
    status: 'new',
    room: clip(input.room, 20),
    guestName: clip(input.guestName, 60),
    comment: clip(input.comment, 500),
    payment: PAYMENTS.includes(input.payment) ? input.payment : 'NONE',
    items,
    itemsCount: items.reduce((s, i) => s + i.qty, 0),
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
    serviceRate,
    lang: LANGS.includes(input.lang) ? input.lang : 'ru',
    source: 'qr-menu'
  };
  if (!order.room || !order.guestName) throw new Error('Не заполнены комната или имя');

  const counterRef = doc(db, 'counters', 'orders');
  const number = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists() ? Number(snap.data().value) || 0 : 0) + 1;
    tx.set(counterRef, { value: next });
    tx.set(doc(db, 'orders', String(next)), { ...order, number: next, createdAt: serverTimestamp() });
    return next;
  });
  return { number };
}
