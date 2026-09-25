export type OrderStatus = 'new' | 'cooking' | 'delivering' | 'done' | 'cancelled';
export type PaymentCode = 'KASPI' | 'JUSAN' | 'HALYK' | 'CASH' | 'NONE';

export interface OrderItem {
  name: string;
  category: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  number: number;
  status: OrderStatus;
  room: string;
  guestName: string;
  comment: string;
  payment: PaymentCode;
  items: OrderItem[];
  itemsCount: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  serviceRate: number;
  lang: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  acceptedAt: Date | null;
  deliveringAt: Date | null;
  doneAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string;
  handledBy: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  theme: ThemeMode;
  sound: boolean;
  /** id мелодии из RINGTONES (src/lib/sound.ts) */
  ringtone: string;
  volume: number; // 0..1
  repeatAlert: boolean;
  vibrate: boolean;
  keepAwake: boolean;
  desktopNotifications: boolean;
}

export type Page = 'orders' | 'stats' | 'settings';
