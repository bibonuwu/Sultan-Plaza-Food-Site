import { useCallback, useMemo, useState } from 'react';
import { ConciergeBell, Search, X } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useOrderActions } from '../hooks/useOrderActions';
import { useNow } from '../hooks/useNow';
import { OrderCard } from '../components/OrderCard';
import { AudioBanner, InstallBanner } from '../components/Banners';
import { EmptyState } from '../components/ui';
import { fullDate, isActive, isToday, money, STATUS_META } from '../lib/format';
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

export function OrdersPage({ onOpen, onOpenSettings, initialFilter }: Props) {
  const { orders, loading, error } = useOrders();
  const act = useOrderActions();
  const now = useNow(30_000);
  const [filter, setFilter] = useState<OrdersFilter>(initialFilter ?? 'active');
  const [q, setQ] = useState('');

  const counts = useMemo(() => {
    const c: Record<OrdersFilter, number> = { active: 0, new: 0, cooking: 0, delivering: 0, done: 0, cancelled: 0, all: orders.length };
    for (const o of orders) {
      c[o.status] += 1;
      if (isActive(o.status)) c.active += 1;
    }
    return c;
  }, [orders]);

  const today = useMemo(() => {
    const d = new Date(now);
    const list = orders.filter((o) => isToday(o.createdAt, d));
    return {
      done: list.filter((o) => o.status === 'done').length,
      revenue: list.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
      count: list.filter((o) => o.status !== 'cancelled').length,
    };
  }, [orders, now]);

  const visible = useMemo(() => {
    let list = orders;
    if (filter === 'active') list = list.filter((o) => isActive(o.status));
    else if (filter !== 'all') list = list.filter((o) => o.status === filter);

    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (o) =>
          String(o.number).includes(s) ||
          o.room.toLowerCase().includes(s) ||
          o.guestName.toLowerCase().includes(s) ||
          o.items.some((i) => i.name.toLowerCase().includes(s)),
      );
    }
    // Активные — по этапам, внутри этапа первыми самые старые (очередь кухни)
    if (filter === 'active' || (filter !== 'all' && isActive(filter as OrderStatus))) {
      list = [...list].sort((a, b) => RANK[a.status] - RANK[b.status] || ts(a) - ts(b));
    }
    return list;
  }, [orders, filter, q]);

  const advance = useCallback(
    (o: Order) => {
      const next = STATUS_META[o.status].next;
      if (next) act(o, next);
    },
    [act],
  );

  return (
    <div className="page">
      <div className="page-head page-head-orders">
        <div>
          <h1 className="page-title">Заказы</h1>
          <p className="page-sub">{fullDate(new Date(now))}</p>
        </div>
        <label className="search">
          <Search size={18} aria-hidden />
          <input
            type="search"
            placeholder="Номер, комната, гость, блюдо"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Поиск заказов"
          />
          {q && (
            <button type="button" className="icon-btn icon-btn-sm" aria-label="Очистить поиск" onClick={() => setQ('')}>
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      <InstallBanner onOpenSettings={onOpenSettings} />
      <AudioBanner />

      <section className="stat-grid" aria-label="Сводка">
        <button type="button" className="stat stat-new" onClick={() => setFilter('new')}>
          <span className="stat-label">Новые</span>
          <span className="stat-value">{counts.new}</span>
        </button>
        <button type="button" className="stat stat-work" onClick={() => setFilter('active')}>
          <span className="stat-label">В работе</span>
          <span className="stat-value">{counts.cooking + counts.delivering}</span>
        </button>
        <button type="button" className="stat stat-done" onClick={() => setFilter('done')}>
          <span className="stat-label">Выполнено сегодня</span>
          <span className="stat-value">{today.done}</span>
        </button>
        <div className="stat stat-money">
          <span className="stat-label">Сумма заказов сегодня</span>
          <span className="stat-value">{money(today.revenue)}</span>
          <span className="stat-hint">{today.count} без учёта отменённых</span>
        </div>
      </section>

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
            <OrderCard key={o.id} order={o} now={now} onOpen={onOpen} onAdvance={advance} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ConciergeBell size={36} />}
          title={q ? 'Ничего не найдено' : filter === 'active' || filter === 'new' ? 'Новых заказов пока нет' : 'Здесь пусто'}
          text={
            q
              ? 'Попробуйте изменить запрос.'
              : filter === 'active' || filter === 'new'
                ? 'Заказы из QR-меню появятся здесь автоматически — прозвучит сигнал и придёт уведомление.'
                : 'Заказов с таким статусом нет среди последних.'
          }
        />
      )}
    </div>
  );
}
