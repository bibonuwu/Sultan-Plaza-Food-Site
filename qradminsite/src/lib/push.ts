// Push-уведомления через Firebase Cloud Messaging.
// Токен устройства сохраняется в Firestore (fcmTokens/{token}); Cloud Function
// notifyNewOrder рассылает по ним уведомление при каждом новом заказе —
// даже если приложение закрыто или телефон заблокирован.
import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { app, db } from '../firebase';
import { FCM_VAPID_KEY } from '../config';
import { isAndroid, isIos, isStandalone } from './pwa';
import type { Order } from '../types';
import { money } from './format';

const TOKEN_KEY = 'spadmin.fcmToken';

export type PushSupport = 'supported' | 'unsupported' | 'ios-install-first';

export class PushError extends Error {
  constructor(public code: 'denied' | 'dismissed' | 'unsupported' | 'no-sw' | 'failed', message?: string) {
    super(message || code);
  }
}

export async function getPushSupport(): Promise<PushSupport> {
  const basic = 'serviceWorker' in navigator && 'Notification' in window && 'PushManager' in window;
  if (!basic) return isIos() && !isStandalone() ? 'ios-install-first' : 'unsupported';
  try {
    return (await isSupported()) ? 'supported' : 'unsupported';
  } catch {
    return 'unsupported';
  }
}

export const getSavedToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const notificationPermission = (): NotificationPermission | 'unsupported' =>
  'Notification' in window ? Notification.permission : 'unsupported';

function platformLabel() {
  if (isAndroid()) return isStandalone() ? 'Android (приложение)' : 'Android (браузер)';
  if (isIos()) return isStandalone() ? 'iOS (приложение)' : 'iOS (браузер)';
  return isStandalone() ? 'Компьютер (приложение)' : 'Компьютер (браузер)';
}

async function swRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');
  if (existing) return existing;
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
  return reg;
}

async function obtainToken(): Promise<string> {
  const registration = await swRegistration();
  const token = await getToken(getMessaging(app), {
    serviceWorkerRegistration: registration,
    ...(FCM_VAPID_KEY ? { vapidKey: FCM_VAPID_KEY } : {}),
  });
  if (!token) throw new PushError('failed', 'Не удалось получить токен уведомлений');
  return token;
}

async function saveToken(token: string, user: { uid: string; email: string | null }) {
  await setDoc(doc(db, 'fcmTokens', token), {
    uid: user.uid,
    email: user.email ?? '',
    userAgent: navigator.userAgent.slice(0, 300),
    platform: platformLabel(),
    updatedAt: serverTimestamp(),
  });
  const previous = getSavedToken();
  if (previous && previous !== token) deleteDoc(doc(db, 'fcmTokens', previous)).catch(() => undefined);
  localStorage.setItem(TOKEN_KEY, token);
}

/** Запросить разрешение и подписать это устройство на уведомления о заказах */
export async function enablePush(user: { uid: string; email: string | null }) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) throw new PushError('unsupported');
  // Разрешение запрашиваем сразу в обработчике нажатия (Safari/iOS не покажет запрос после await)
  const permission = await Notification.requestPermission();
  if (permission === 'denied') throw new PushError('denied');
  if (permission !== 'granted') throw new PushError('dismissed');
  if ((await getPushSupport()) !== 'supported') throw new PushError('unsupported');
  const token = await obtainToken();
  await saveToken(token, user);
  return token;
}

/** Тихо обновить токен при запуске (токены FCM периодически меняются) */
export async function refreshPush(user: { uid: string; email: string | null }) {
  if (!getSavedToken() || notificationPermission() !== 'granted') return;
  if ((await getPushSupport()) !== 'supported') return;
  const token = await obtainToken();
  await saveToken(token, user);
}

/** Отписать это устройство */
export async function disablePush() {
  const token = getSavedToken();
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  if (token) await deleteDoc(doc(db, 'fcmTokens', token)).catch(() => undefined);
  try {
    if (await isSupported()) await deleteToken(getMessaging(app));
  } catch {
    /* ignore */
  }
}

/** Локальное системное уведомление (когда вкладка открыта, но свёрнута) */
export async function showLocalOrderNotification(order: Order) {
  if (notificationPermission() !== 'granted' || !('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration('/');
  const tag = `order-${order.id}`;
  // Push от сервера мог прийти раньше — не дублируем
  if (reg && (await reg.getNotifications({ tag })).length) return;
  const items = order.items
    .slice(0, 4)
    .map((i) => `${i.qty}× ${i.name}`)
    .join(', ');
  const options: NotificationOptions & { renotify?: boolean; vibrate?: number[] } = {
    body: `${order.guestName} — ${money(order.total)}\n${items}`,
    tag,
    renotify: true,
    requireInteraction: true,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    vibrate: [300, 120, 300],
    data: { url: `/?order=${encodeURIComponent(order.id)}`, orderId: order.id },
  };
  const title = `Новый заказ №${order.number} · комната ${order.room}`;
  if (reg) await reg.showNotification(title, options);
  else new Notification(title, options);
}

export async function showTestNotification() {
  if (notificationPermission() !== 'granted') throw new PushError('denied');
  const reg = await navigator.serviceWorker.getRegistration('/');
  if (!reg) throw new PushError('no-sw');
  await reg.showNotification('Проверка уведомлений', {
    body: 'Так будут выглядеть уведомления о новых заказах.',
    tag: 'sp-test',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
  });
}
