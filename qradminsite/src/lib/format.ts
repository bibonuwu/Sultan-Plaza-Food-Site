import type { OrderStatus, PaymentCode } from '../types';

const moneyFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const compactFmt = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const timeFmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const dateTimeFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});
const fullDateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

export const money = (n: number) => `${moneyFmt.format(Math.round(n || 0))} ₸`;
export const moneyCompact = (n: number) => (n >= 100_000 ? `${compactFmt.format(n)} ₸` : money(n));
export const time = (d: Date | null) => (d ? timeFmt.format(d) : '—');
export const dateTime = (d: Date | null) => (d ? dateTimeFmt.format(d) : '—');
export const fullDate = (d: Date) => fullDateFmt.format(d);

export function isToday(d: Date | null, now = new Date()) {
  return !!d && d.toDateString() === now.toDateString();
}

/** «только что», «5 мин», «1 ч 20 мин», для старых — дата/время */
export function elapsed(from: Date | null, now: number = Date.now()): string {
  if (!from) return 'только что';
  const mins = Math.floor((now - from.getTime()) / 60_000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} ч ${mins % 60} мин назад`;
  return dateTime(from);
}

export function minutesSince(from: Date | null, now: number = Date.now()) {
  return from ? Math.floor((now - from.getTime()) / 60_000) : 0;
}

export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const PAYMENT_LABEL: Record<PaymentCode, string> = {
  KASPI: 'Kaspi',
  JUSAN: 'Jusan',
  HALYK: 'Halyk',
  CASH: 'Наличные',
  NONE: 'Не выбрана',
};

export interface StatusMeta {
  label: string;
  /** подпись кнопки перехода к следующему статусу */
  action?: string;
  next?: OrderStatus;
  prev?: OrderStatus;
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  new: { label: 'Новый', action: 'Принять', next: 'cooking' },
  cooking: { label: 'Готовится', action: 'Передать в доставку', next: 'delivering', prev: 'new' },
  delivering: { label: 'В пути', action: 'Доставлен', next: 'done', prev: 'cooking' },
  done: { label: 'Выполнен', prev: 'delivering' },
  cancelled: { label: 'Отменён' },
};

export const ACTIVE_STATUSES: OrderStatus[] = ['new', 'cooking', 'delivering'];
export const isActive = (s: OrderStatus) => ACTIVE_STATUSES.includes(s);
