import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchOrdersInRange } from '../lib/orders';
import { money, PAYMENT_LABEL, plural } from '../lib/format';
import { Segmented, Spinner } from '../components/ui';
import { MAX_STORED_ORDERS } from '../config';
import type { Order, PaymentCode } from '../types';

type Period = 'today' | 'yesterday' | 'week' | 'month';

const PERIODS: Array<{ value: Period; label: string }> = [
  { value: 'today', label: 'Сегодня' },
  { value: 'yesterday', label: 'Вчера' },
  { value: 'week', label: '7 дней' },
  { value: 'month', label: '30 дней' },
];

function rangeFor(p: Period): [Date, Date] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const day = 86_400_000;
  const tomorrow = new Date(start.getTime() + day);
  if (p === 'today') return [start, tomorrow];
  if (p === 'yesterday') return [new Date(start.getTime() - day), start];
  if (p === 'week') return [new Date(start.getTime() - 6 * day), tomorrow];
  return [new Date(start.getTime() - 29 * day), tomorrow];
}

const ordersWord = (n: number) => plural(n, 'заказ', 'заказа', 'заказов');

/* ---------- Заказы по часам: одна серия, колонки ---------- */
function HourlyChart({ data }: { data: number[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(...data);
  const scale = Math.max(1, max);
  const peak = max > 0 ? data.indexOf(max) : -1;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setActive((a) => (a === null ? 0 : Math.min(23, a + 1)));
    else if (e.key === 'ArrowLeft') setActive((a) => (a === null ? 23 : Math.max(0, a - 1)));
    else return;
    e.preventDefault();
  };

  const hh = (h: number) => String(h).padStart(2, '0');

  return (
    <div className="chart">
      <div
        className="chart-plot"
        tabIndex={0}
        role="group"
        aria-label="Заказы по часам. Стрелками влево и вправо можно выбрать час."
        onKeyDown={onKey}
        onMouseLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
      >
        <div className="chart-grid" aria-hidden>
          <span className="chart-grid-label">{max}</span>
        </div>
        <div className="chart-cols">
          {data.map((v, h) => {
            const pct = (v / scale) * 100;
            return (
              <div
                key={h}
                className={`chart-col ${active === h ? 'is-active' : ''} ${active !== null && active !== h ? 'is-dim' : ''}`}
                onMouseEnter={() => setActive(h)}
                onClick={() => setActive(h)}
              >
                <div className="chart-bar" style={{ height: `${pct}%` }} />
                {h === peak && active === null && (
                  <span className="chart-peak" style={{ bottom: `calc(${pct}% + 4px)` }}>
                    {v}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {active !== null && (
          <div className="chart-tip" style={{ left: `${((active + 0.5) / 24) * 100}%` }} role="status">
            <span className="chart-tip-title">
              {hh(active)}:00–{hh(active)}:59
            </span>
            <span>
              {data[active]} {ordersWord(data[active])}
            </span>
          </div>
        )}
      </div>
      <div className="chart-xaxis" aria-hidden>
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
          <span key={h} style={{ left: `${((h + 0.5) / 24) * 100}%` }}>
            {hh(h)}
          </span>
        ))}
      </div>
      <button type="button" className="link-btn" onClick={() => setShowTable((s) => !s)}>
        {showTable ? 'Скрыть таблицу' : 'Показать таблицей'}
      </button>
      {showTable && (
        <table className="table table-compact">
          <thead>
            <tr>
              <th>Час</th>
              <th className="num">Заказов</th>
            </tr>
          </thead>
          <tbody>
            {data.map((v, h) =>
              v > 0 ? (
                <tr key={h}>
                  <td>
                    {hh(h)}:00–{hh(h)}:59
                  </td>
                  <td className="num">{v}</td>
                </tr>
              ) : null,
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ---------- Страница ---------- */
export function StatsPage() {
  const [period, setPeriod] = useState<Period>('today');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: Period) => {
    setLoading(true);
    setError(null);
    try {
      const [from, to] = rangeFor(p);
      setOrders(await fetchOrdersInRange(from, to));
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить статистику. Проверьте интернет.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  const stats = useMemo(() => {
    const all = orders ?? [];
    const valid = all.filter((o) => o.status !== 'cancelled');
    const revenue = valid.reduce((s, o) => s + o.total, 0);
    const service = valid.reduce((s, o) => s + o.serviceFee, 0);

    const hourly = Array.from({ length: 24 }, () => 0);
    valid.forEach((o) => o.createdAt && (hourly[o.createdAt.getHours()] += 1));

    const itemMap = new Map<string, { name: string; qty: number; sum: number }>();
    valid.forEach((o) =>
      o.items.forEach((i) => {
        const cur = itemMap.get(i.name) ?? { name: i.name, qty: 0, sum: 0 };
        cur.qty += i.qty;
        cur.sum += i.qty * i.price;
        itemMap.set(i.name, cur);
      }),
    );
    const topItems = [...itemMap.values()].sort((a, b) => b.qty - a.qty || b.sum - a.sum).slice(0, 10);

    const payMap = new Map<PaymentCode, { count: number; sum: number }>();
    valid.forEach((o) => {
      const cur = payMap.get(o.payment) ?? { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += o.total;
      payMap.set(o.payment, cur);
    });
    const payments = [...payMap.entries()].map(([code, v]) => ({ code, ...v })).sort((a, b) => b.sum - a.sum);

    return {
      revenue,
      service,
      count: valid.length,
      avg: valid.length ? revenue / valid.length : 0,
      cancelled: all.length - valid.length,
      hourly,
      topItems,
      payments,
    };
  }, [orders]);

  const maxItemQty = Math.max(1, ...stats.topItems.map((i) => i.qty));
  const maxPay = Math.max(1, ...stats.payments.map((p) => p.sum));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Статистика</h1>
          <p className="page-sub">
            По последним {MAX_STORED_ORDERS} заказам, которые хранятся в базе (без отменённых)
          </p>
        </div>
      </div>

      <div className="filter-row">
        <Segmented ariaLabel="Период" value={period} options={PERIODS} onChange={setPeriod} />
        <button type="button" className="btn btn-ghost" onClick={() => load(period)} disabled={loading}>
          {loading ? <Spinner size={18} /> : <RefreshCw size={18} aria-hidden />} Обновить
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {orders === null && loading ? (
        <div className="center-pad">
          <Spinner size={28} />
        </div>
      ) : (
        <div className={`stats ${loading ? 'is-refreshing' : ''}`}>
          <section className="stat-grid" aria-label="Итоги периода">
            <div className="stat stat-hero">
              <span className="stat-label">Выручка</span>
              <span className="stat-value">{money(stats.revenue)}</span>
              <span className="stat-hint">в т.ч. сервисный сбор {money(stats.service)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Заказов</span>
              <span className="stat-value">{stats.count}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Средний чек</span>
              <span className="stat-value">{money(stats.avg)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Отменено</span>
              <span className="stat-value">{stats.cancelled}</span>
            </div>
          </section>

          <div className="stats-cols">
            <section className="card">
              <h2 className="card-title">Заказы по часам</h2>
              {stats.count ? <HourlyChart data={stats.hourly} /> : <p className="muted">Нет заказов за этот период.</p>}
            </section>

            <section className="card">
              <h2 className="card-title">Способы оплаты</h2>
              {stats.payments.length ? (
                <ul className="hbars">
                  {stats.payments.map((p) => (
                    <li key={p.code} className="hbar">
                      <div className="hbar-head">
                        <span>{PAYMENT_LABEL[p.code]}</span>
                        <span className="hbar-value">
                          {money(p.sum)} <span className="muted">· {p.count} {ordersWord(p.count)}</span>
                        </span>
                      </div>
                      <div className="hbar-track">
                        <div className="hbar-fill" style={{ width: `${(p.sum / maxPay) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Нет данных.</p>
              )}
            </section>
          </div>

          <section className="card">
            <h2 className="card-title">Популярные позиции</h2>
            {stats.topItems.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th className="num rank-col">#</th>
                    <th>Позиция</th>
                    <th className="qty-col">Продано</th>
                    <th className="num">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topItems.map((it, i) => (
                    <tr key={it.name}>
                      <td className="num muted rank-col">{i + 1}</td>
                      <td>{it.name}</td>
                      <td className="qty-col">
                        <div className="qty-cell">
                          <span className="qty-num">{it.qty}</span>
                          <span className="qty-track" aria-hidden>
                            <span className="qty-fill" style={{ width: `${(it.qty / maxItemQty) * 100}%` }} />
                          </span>
                        </div>
                      </td>
                      <td className="num">{money(it.sum)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">Нет данных.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
