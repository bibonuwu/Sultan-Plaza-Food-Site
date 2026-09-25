import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { subscribeLiveOrders } from '../lib/orders';
import { playRingtone, vibrate } from '../lib/sound';
import { showLocalOrderNotification } from '../lib/push';
import { money, plural } from '../lib/format';
import { ALERT_REPEAT_SECONDS } from '../config';
import { useSettings } from './useSettings';
import { useToast } from '../components/Toast';
import type { Order } from '../types';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  /** данные из локального кэша — нет связи с сервером */
  fromCache: boolean;
}

interface OrdersCtx extends OrdersState {
  newOrders: Order[];
  online: boolean;
}

const Ctx = createContext<OrdersCtx | null>(null);

function describeError(err: Error) {
  const code = (err as { code?: string }).code;
  if (code === 'permission-denied') return 'Нет доступа к заказам. Проверьте, что ваш аккаунт добавлен в коллекцию staff.';
  if (code === 'failed-precondition') return 'Нужен индекс Firestore. Выполните deploy.bat → «Правила и индексы».';
  return 'Не удалось загрузить заказы. Проверьте интернет.';
}

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', on);
    };
  }, []);
  return online;
}

/** Живая лента заказов + звуковые/системные оповещения о новых заказах */
export function OrdersProvider({ children, onOpenOrder }: { children: ReactNode; onOpenOrder: (id: string) => void }) {
  const [state, setState] = useState<OrdersState>({ orders: [], loading: true, error: null, fromCache: true });
  const { settings } = useSettings();
  const toast = useToast();
  const online = useOnline();

  const known = useRef(new Set<string>());
  const settingsRef = useRef(settings);
  const toastRef = useRef(toast);
  const openRef = useRef(onOpenOrder);
  settingsRef.current = settings;
  toastRef.current = toast;
  openRef.current = onOpenOrder;

  useEffect(() => {
    const alertAbout = (fresh: Order[]) => {
      const s = settingsRef.current;
      if (s.sound) playRingtone(s.ringtone, s.volume);
      if (s.vibrate) vibrate();
      const first = fresh[0];
      toastRef.current({
        tone: 'order',
        title:
          fresh.length === 1
            ? `Новый заказ №${first.number}`
            : `${fresh.length} ${plural(fresh.length, 'новый заказ', 'новых заказа', 'новых заказов')}`,
        description:
          fresh.length === 1
            ? `Комната ${first.room} · ${first.guestName} · ${money(first.total)}`
            : fresh.map((o) => `№${o.number} (к. ${o.room})`).join(', '),
        action: { label: 'Открыть', onClick: () => openRef.current(first.id) },
      });
      if (document.visibilityState === 'hidden' && s.desktopNotifications) {
        fresh.forEach((o) => showLocalOrderNotification(o).catch(() => undefined));
      }
    };

    return subscribeLiveOrders(
      ({ orders, added, fromCache, initial }) => {
        setState({ orders, loading: false, error: null, fromCache });
        if (initial) {
          orders.forEach((o) => known.current.add(o.id));
          return;
        }
        const fresh = added.filter((o) => !known.current.has(o.id));
        fresh.forEach((o) => known.current.add(o.id));
        const toAlert = fresh.filter((o) => o.status === 'new').sort((a, b) => a.number - b.number);
        if (toAlert.length) alertAbout(toAlert);
      },
      (err) => {
        console.error(err);
        setState((s) => ({ ...s, loading: false, error: describeError(err) }));
      },
    );
  }, []);

  const newOrders = useMemo(() => state.orders.filter((o) => o.status === 'new'), [state.orders]);
  const newCount = newOrders.length;

  // Повторять сигнал, пока есть непринятые заказы
  const hasNew = newCount > 0;
  useEffect(() => {
    if (!hasNew || !settings.sound || !settings.repeatAlert) return;
    const id = window.setInterval(() => {
      playRingtone(settings.ringtone, settings.volume);
      if (settings.vibrate) vibrate([200, 100, 200]);
    }, ALERT_REPEAT_SECONDS * 1000);
    return () => window.clearInterval(id);
  }, [hasNew, settings.sound, settings.repeatAlert, settings.ringtone, settings.volume, settings.vibrate]);

  // Счётчик в заголовке вкладки и на иконке установленного приложения
  useEffect(() => {
    document.title = newCount ? `(${newCount}) Новые заказы — Sultan Plaza` : 'Sultan Plaza — Заказы';
    const nav = navigator as Navigator & {
      setAppBadge?: (n: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (newCount) nav.setAppBadge?.(newCount).catch(() => undefined);
    else nav.clearAppBadge?.().catch(() => undefined);
  }, [newCount]);

  const value = useMemo(() => ({ ...state, newOrders, online }), [state, newOrders, online]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrders() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useOrders must be used inside OrdersProvider');
  return v;
}
