import { useCallback, useMemo, useState } from 'react';
import { ConciergeBell, Trash2 } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useOrderActions } from '../hooks/useOrderActions';
import { useNow } from '../hooks/useNow';
import { OrderCard } from '../components/OrderCard';
import { AudioBanner, InstallBanner } from '../components/Banners';
import { useToast } from '../components/Toast';
import { EmptyState, Modal, Spinner } from '../components/ui';
import { fullDate, isActive, money, STATUS_META } from '../lib/format';
import { deleteOrder } from '../lib/orders';
import type { Order, OrderStatus } from '../types';

export type OrdersFilter = 'active' | OrderStatus | 'all';

const FILTERS: Array<{ id: OrdersFilter; label: string }> = [
  { id: 'active', label: 'Активные' },
  { id: 'new', label: 'Новые' },
  { id: 'cooking', label: 'Готовятся' },
  { id: 'delivering', label: 'В пути' },
  { id: 'done', label: 'Выполненные' },
  { id: 'cancelled', label: 'Отменённые' },
  { id: 'all', label: 'Все' },
];

const RANK: Record<OrderStatus, number> = { new: 0, cooking: 1, delivering: 2, done: 3, cancelled: 4 };
const ts = (o: Order) => o.createdAt?.getTime() ?? Date.now();

interface Props {
  onOpen: (id: string) => void;
  onOpenSettings: () => void;
  initialFilter?: OrdersFilter;
}

/** Подтверждение удаления одного заказа прямо из списка */
function DeleteOrderDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (!order) return null;

  const remove = async () => {
    setBusy(true);
    try {
      await deleteOrder(order.id);
      toast({ tone: 'info', title: `Заказ №${order.number} удалён` });
      onClose();
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', title: 'Не удалось удалить заказ', description: 'Проверьте интернет и попробуйте ещё раз.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={() => !busy && onClose()}
      title={`Удалить заказ №${order.number}?`}
      footer={
        <>
          <span className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>
            {busy ? <Spinner size={18} /> : <Trash2 size={18} aria-hidden />} Удалить навсегда
          </button>
        </>
      }
    >
      <p>
        Комната <strong>{order.room}</strong>, {order.guestName} — {money(order.total)}.
      </p>
      {isActive(order.status) && (
        <div className="alert alert-error">Заказ ещё не выполнен — возможно, лучше его отменить.</div>
      )}
      <p className="muted small">Восстановить удалённый заказ будет нельзя.</p>
    </Modal>
  );
}

export function OrdersPage({ onOpen, onOpenSettings, initialFilter }: Props) {
  const { orders, loading, error } = useOrders();
  const act = useOrderActions();
  const now = useNow(30_000);
  const [filter, setFilter] = useState<OrdersFilter>(initialFilter ?? 'active');
  const [toDelete, setToDelete] = useState<Order | null>(null);

  const counts = useMemo(() => {
    const c: Record<OrdersFilter, number> = { active: 0, new: 0, cooking: 0, delivering: 0, done: 0, cancelled: 0, all: orders.length };
    for (const o of orders) {
      c[o.status] += 1;
      if (isActive(o.status)) c.active += 1;
    }
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    let list = orders;
    if (filter === 'active') list = list.filter((o) => isActive(o.status));
    else if (filter !== 'all') list = list.filter((o) => o.status === filter);
    // Активные — по этапам, внутри этапа первыми самые старые (очередь кухни)
    if (filter === 'active' || (filter !== 'all' && isActive(filter))) {
      list = [...list].sort((a, b) => RANK[a.status] - RANK[b.status] || ts(a) - ts(b));
    }
    return list;
  }, [orders, filter]);

  const advance = useCallback(
    (o: Order) => {
      const next = STATUS_META[o.status].next;
      if (next) act(o, next);
    },
    [act],
  );
  const closeDelete = useCallback(() => setToDelete(null), []);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Заказы</h1>
          <p className="page-sub">{fullDate(new Date(now))}</p>
        </div>
      </div>

      <InstallBanner onOpenSettings={onOpenSettings} />
      <AudioBanner />

      <div className="filters" role="tablist" aria-label="Фильтр заказов">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`filter ${filter === f.id ? 'is-active' : ''} ${f.id === 'new' && counts.new > 0 ? 'has-new' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="filter-count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="orders-grid" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="order-card skeleton" />
          ))}
        </div>
      ) : visible.length ? (
        <div className="orders-grid">
          {visible.map((o) => (
            <OrderCard key={o.id} order={o} now={now} onOpen={onOpen} onAdvance={advance} onDelete={setToDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ConciergeBell size={36} />}
          title={filter === 'active' || filter === 'new' ? 'Новых заказов пока нет' : 'Здесь пусто'}
          text={
            filter === 'active' || filter === 'new'
              ? 'Заказы из QR-меню появятся здесь автоматически — прозвучит сигнал и придёт уведомление.'
              : 'Заказов с таким статусом нет.'
          }
        />
      )}

      <DeleteOrderDialog order={toDelete} onClose={closeDelete} />
    </div>
  );
}
