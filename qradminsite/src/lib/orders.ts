import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { LIVE_ORDERS_LIMIT } from '../config';
import type { Order, OrderItem, OrderStatus, PaymentCode } from '../types';

const ordersCol = collection(db, 'orders');

const toDate = (v: unknown): Date | null => (v instanceof Timestamp ? v.toDate() : null);
const toNum = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const toStr = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

const STATUSES: OrderStatus[] = ['new', 'cooking', 'delivering', 'done', 'cancelled'];
const PAYMENTS: PaymentCode[] = ['KASPI', 'JUSAN', 'HALYK', 'CASH', 'NONE'];

export function toOrder(snap: DocumentSnapshot): Order {
  // 'estimate' — чтобы только что изменённые поля времени не были пустыми до ответа сервера
  const d = snap.data({ serverTimestamps: 'estimate' }) ?? {};
  const items: OrderItem[] = Array.isArray(d.items)
    ? d.items.map((i: Record<string, unknown>) => ({
        name: toStr(i?.name),
        category: toStr(i?.category),
        price: toNum(i?.price),
        qty: toNum(i?.qty),
      }))
    : [];
  return {
    id: snap.id,
    number: toNum(d.number),
    status: STATUSES.includes(d.status) ? d.status : 'new',
    room: toStr(d.room),
    guestName: toStr(d.guestName),
    comment: toStr(d.comment),
    payment: PAYMENTS.includes(d.payment) ? d.payment : 'NONE',
    items,
    itemsCount: toNum(d.itemsCount) || items.reduce((s, i) => s + i.qty, 0),
    subtotal: toNum(d.subtotal),
    serviceFee: toNum(d.serviceFee),
    total: toNum(d.total),
    serviceRate: toNum(d.serviceRate),
    lang: toStr(d.lang) || 'ru',
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
    acceptedAt: toDate(d.acceptedAt),
    deliveringAt: toDate(d.deliveringAt),
    doneAt: toDate(d.doneAt),
    cancelledAt: toDate(d.cancelledAt),
    cancelReason: toStr(d.cancelReason),
    handledBy: toStr(d.handledBy),
  };
}

export interface LiveSnapshot {
  orders: Order[];
  /** id заказов, добавленных после первой загрузки */
  added: Order[];
  fromCache: boolean;
  initial: boolean;
}

/** Живая лента последних заказов */
export function subscribeLiveOrders(onData: (s: LiveSnapshot) => void, onError: (e: Error) => void): Unsubscribe {
  const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(LIVE_ORDERS_LIMIT));
  let initial = true;
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => {
      const added = initial
        ? []
        : snap
            .docChanges()
            .filter((c) => c.type === 'added')
            .map((c) => toOrder(c.doc));
      onData({ orders: snap.docs.map(toOrder), added, fromCache: snap.metadata.fromCache, initial });
      initial = false;
    },
    onError,
  );
}

/** Один заказ в реальном времени (окно деталей) */
export function subscribeOrder(id: string, onData: (o: Order | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'orders', id),
    (snap) => onData(snap.exists() ? toOrder(snap) : null),
    () => onData(null),
  );
}

const STATUS_TIME_FIELD: Partial<Record<OrderStatus, string>> = {
  cooking: 'acceptedAt',
  delivering: 'deliveringAt',
  done: 'doneAt',
  cancelled: 'cancelledAt',
};

export function setOrderStatus(orderId: string, status: OrderStatus, by: string, cancelReason?: string) {
  const patch: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
    handledBy: by,
  };
  const field = STATUS_TIME_FIELD[status];
  if (field) patch[field] = serverTimestamp();
  if (status === 'cancelled') patch.cancelReason = (cancelReason ?? '').slice(0, 200);
  return updateDoc(doc(db, 'orders', orderId), patch);
}

/* ---------- Удаление ---------- */

export const deleteOrder = (id: string) => deleteDoc(doc(db, 'orders', id));

/** Сколько заказов сейчас хранится в базе */
export async function countOrders(): Promise<number> {
  return (await getCountFromServer(ordersCol)).data().count;
}

export type DeleteScope = 'finished' | 'all';

/**
 * Массовое удаление: 'finished' — выполненные и отменённые, 'all' — все заказы.
 * resetNumbering (только для 'all') — следующий заказ снова получит №1.
 */
export async function deleteOrders(scope: DeleteScope, resetNumbering = false): Promise<number> {
  const q = scope === 'all' ? query(ordersCol) : query(ordersCol, where('status', 'in', ['done', 'cancelled']));
  const snap = await getDocs(q);
  for (let i = 0; i < snap.docs.length; i += 450) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  if (scope === 'all' && resetNumbering) await deleteDoc(doc(db, 'counters', 'orders'));
  return snap.size;
}

/** Заказы за период (для статистики) */
export async function fetchOrdersInRange(from: Date, to: Date): Promise<Order[]> {
  const q = query(
    ordersCol,
    where('createdAt', '>=', Timestamp.fromDate(from)),
    where('createdAt', '<', Timestamp.fromDate(to)),
    orderBy('createdAt', 'desc'),
    limit(5000),
  );
  const snap = await getDocs(q);
  return snap.docs.map(toOrder);
}
