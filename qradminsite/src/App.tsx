import { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { SettingsProvider, useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import { OrdersProvider } from './hooks/useOrders';
import { useWakeLock } from './hooks/useWakeLock';
import { ToastProvider } from './components/Toast';
import { Shell } from './components/Shell';
import { OrderDetails } from './components/OrderDetails';
import { PrintTicket } from './components/PrintTicket';
import { Spinner } from './components/ui';
import { LoginPage } from './pages/LoginPage';
import { ErrorScreen, NoAccessPage } from './pages/NoAccessPage';
import { OrdersPage, type OrdersFilter } from './pages/OrdersPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { subscribeOrder } from './lib/orders';
import { refreshPush } from './lib/push';
import type { Order, Page } from './types';

// Параметры запуска: ярлыки PWA (?page=stats, ?filter=new) и клик по уведомлению (?order=ID)
const launch = new URLSearchParams(window.location.search);
const initialPage: Page = launch.get('page') === 'stats' ? 'stats' : launch.get('page') === 'settings' ? 'settings' : 'orders';
const initialFilter: OrdersFilter | undefined = launch.get('filter') === 'new' ? 'new' : undefined;
const initialOrder = launch.get('order');

function SelectedOrder({ id, onClose, onPrint }: { id: string | null; onClose: () => void; onPrint: (o: Order) => void }) {
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    setOrder(null);
    if (!id) return;
    return subscribeOrder(id, setOrder);
  }, [id]);
  if (!id || !order) return null;
  return <OrderDetails order={order} onClose={onClose} onPrint={onPrint} />;
}

function AdminApp({ user }: { user: User }) {
  const [page, setPage] = useState<Page>(initialPage);
  const [selectedId, setSelectedId] = useState<string | null>(initialOrder);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', '/');
  }, []);

  const openOrder = useCallback((id: string) => {
    setPage('orders');
    setSelectedId(id);
  }, []);
  const closeOrder = useCallback(() => setSelectedId(null), []);
  const printDone = useCallback(() => setPrintOrder(null), []);
  const openSettings = useCallback(() => setPage('settings'), []);

  // Клик по push-уведомлению, когда приложение уже открыто
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'open-order' && e.data.orderId) openOrder(e.data.orderId);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [openOrder]);

  // FCM-токен периодически обновляется — пересохраняем при запуске
  useEffect(() => {
    refreshPush(user).catch((err) => console.warn('Push refresh failed', err));
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  return (
    <OrdersProvider onOpenOrder={openOrder}>
      <Shell page={page} onNavigate={setPage} email={user.email}>
        {page === 'orders' && <OrdersPage onOpen={setSelectedId} onOpenSettings={openSettings} initialFilter={initialFilter} />}
        {page === 'stats' && <StatsPage />}
        {page === 'settings' && <SettingsPage user={user} />}
      </Shell>
      <SelectedOrder id={selectedId} onClose={closeOrder} onPrint={setPrintOrder} />
      <PrintTicket order={printOrder} onDone={printDone} />
    </OrdersProvider>
  );
}

function Root() {
  const { state, retry } = useAuth();
  const { settings } = useSettings();
  useWakeLock(settings.keepAwake && state.status === 'ready');

  switch (state.status) {
    case 'loading':
    case 'checking':
      return (
        <div className="splash">
          <img src="/logo.png" alt="Sultan Plaza Hotel" className="splash-logo" />
          <Spinner size={28} />
        </div>
      );
    case 'signed-out':
      return <LoginPage />;
    case 'no-access':
      return <NoAccessPage user={state.user} onRetry={retry} />;
    case 'error':
      return <ErrorScreen message={state.message} onRetry={retry} />;
    case 'ready':
      return <AdminApp user={state.user} />;
  }
}

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <Root />
      </ToastProvider>
    </SettingsProvider>
  );
}
