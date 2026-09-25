// Cloud Functions для Sultan Plaza.
// notifyNewOrder срабатывает на каждый новый заказ:
//  1) рассылает push-уведомления на устройства сотрудников;
//  2) удаляет самые старые заказы, оставляя в базе последние MAX_STORED_ORDERS.
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import * as logger from 'firebase-functions/logger';
import { trimOldOrders } from './cleanup.js';

// Сколько последних заказов хранить в базе (то же число — в src/config.ts админки)
const MAX_STORED_ORDERS = 50;

// База Firestore находится в мульти-регионе eur3 → функция в europe-west1 (входит в eur3).
setGlobalOptions({ region: 'europe-west1', maxInstances: 5, memory: '256MiB' });

initializeApp();
const db = getFirestore();

// Токены, которые больше не действуют (приложение удалено, разрешение отозвано и т.п.)
const STALE_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

const money = (n) => `${new Intl.NumberFormat('ru-RU').format(Math.round(Number(n) || 0))} ₸`;

function describeItems(items) {
  const list = Array.isArray(items) ? items : [];
  const head = list.slice(0, 4).map((i) => `${i.qty}× ${i.name}`).join(', ');
  return list.length > 4 ? `${head} и ещё ${list.length - 4}` : head;
}

async function sendPush(orderId, order) {
  const tokensSnap = await db.collection('fcmTokens').get();
  if (tokensSnap.empty) {
    logger.info('Новый заказ, но нет устройств с включёнными уведомлениями', { orderId });
    return;
  }
  const tokens = tokensSnap.docs.map((d) => d.id);

  // Data-only сообщение: уведомление показывает наш service worker (sw.js),
  // чтобы у всех устройств был одинаковый вид, звук и группировка по заказу.
  const data = {
    type: 'new-order',
    orderId,
    number: String(order.number ?? ''),
    title: `Новый заказ №${order.number} · комната ${order.room}`,
    body: `${order.guestName} — ${money(order.total)}\n${describeItems(order.items)}`,
    url: `/?order=${encodeURIComponent(orderId)}`,
  };

  let sent = 0;
  const stale = [];
  for (let i = 0; i < tokens.length; i += 500) {
    const chunk = tokens.slice(i, i + 500);
    const res = await getMessaging().sendEachForMulticast({
      tokens: chunk,
      data,
      webpush: { headers: { Urgency: 'high', TTL: '3600' } },
      android: { priority: 'high', ttl: 3600 * 1000 },
    });
    sent += res.successCount;
    res.responses.forEach((r, idx) => {
      if (!r.success && STALE_TOKEN_CODES.has(r.error?.code)) stale.push(chunk[idx]);
      else if (!r.success) logger.warn('Ошибка отправки push', { code: r.error?.code, message: r.error?.message });
    });
  }

  if (stale.length) {
    const batch = db.batch();
    stale.forEach((t) => batch.delete(db.collection('fcmTokens').doc(t)));
    await batch.commit();
  }

  logger.info('Push о новом заказе отправлен', { orderId, number: order.number, sent, total: tokens.length, removed: stale.length });
}

export const notifyNewOrder = onDocumentCreated('orders/{orderId}', async (event) => {
  const order = event.data?.data();
  if (!order) return;
  const { orderId } = event.params;

  // Сначала push — важна скорость; ошибка одного шага не мешает другому
  try {
    await sendPush(orderId, order);
  } catch (err) {
    logger.error('Не удалось отправить push', err);
  }

  try {
    const removed = await trimOldOrders(db, MAX_STORED_ORDERS);
    if (removed) logger.info(`Автоочистка: удалено старых заказов — ${removed}`, { keep: MAX_STORED_ORDERS });
  } catch (err) {
    logger.error('Ошибка автоочистки заказов', err);
  }
});
