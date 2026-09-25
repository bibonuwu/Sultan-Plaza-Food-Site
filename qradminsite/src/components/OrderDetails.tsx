import { useEffect, useState } from 'react';
import { Printer, Undo2, CircleX } from 'lucide-react';
import { Modal, StatusBadge } from './ui';
import { dateTime, money, PAYMENT_LABEL, STATUS_META, time, isActive } from '../lib/format';
import { useOrderActions } from '../hooks/useOrderActions';
import type { Order } from '../types';

const CANCEL_REASONS = ['Гость отказался', 'Нет в наличии', 'Повторный заказ', 'Не удалось связаться'];
const LANG_LABEL: Record<string, string> = { ru: 'Русский', kk: 'Қазақша', en: 'English' };

interface Props {
  order: Order | null;
  onClose: () => void;
  onPrint: (order: Order) => void;
}

export function OrderDetails({ order, onClose, onPrint }: Props) {
  const act = useOrderActions();
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    setCancelling(false);
    setReason('');
  }, [order?.id]);

  if (!order) return null;
  const meta = STATUS_META[order.status];

  const timeline: Array<{ label: string; at: Date | null; tone?: string }> = [
    { label: 'Заказ создан', at: order.createdAt },
    { label: 'Принят в работу', at: order.acceptedAt },
    { label: 'Передан в доставку', at: order.deliveringAt },
    { label: 'Доставлен', at: order.doneAt, tone: 'done' },
    { label: 'Отменён', at: order.cancelledAt, tone: 'cancelled' },
  ].filter((s) => s.at);

  const footer = cancelling ? (
    <>
      <button type="button" className="btn btn-ghost" onClick={() => setCancelling(false)}>
        Назад
      </button>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => {
          act(order, 'cancelled', reason.trim());
          setCancelling(false);
        }}
      >
        Отменить заказ
      </button>
    </>
  ) : (
    <>
      <button type="button" className="btn btn-ghost" onClick={() => onPrint(order)}>
        <Printer size={18} aria-hidden /> Печать
      </button>
      {isActive(order.status) && (
        <button type="button" className="btn btn-ghost btn-danger-text" onClick={() => setCancelling(true)}>
          <CircleX size={18} aria-hidden /> Отменить
        </button>
      )}
      <span className="spacer" />
      {(meta.prev || order.status === 'cancelled') && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => act(order, order.status === 'cancelled' ? 'new' : meta.prev!)}
          title="Вернуть на предыдущий этап"
        >
          <Undo2 size={18} aria-hidden /> {order.status === 'cancelled' ? 'Восстановить' : 'Назад'}
        </button>
      )}
      {meta.next && (
        <button type="button" className="btn btn-primary" onClick={() => act(order, meta.next!)}>
          {meta.action}
        </button>
      )}
    </>
  );

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={
        <span className="od-title">
          Заказ №{order.number} <StatusBadge status={order.status} />
        </span>
      }
      footer={footer}
    >
      {cancelling ? (
        <div className="od-cancel">
          <p className="muted">Укажите причину отмены (необязательно):</p>
          <div className="chips">
            {CANCEL_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                className={`chip chip-btn ${reason === r ? 'is-active' : ''}`}
                onClick={() => setReason(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            className="input"
            placeholder="Своя причина…"
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      ) : (
        <>
          <dl className="od-grid">
            <div>
              <dt>Комната</dt>
              <dd className="od-room">{order.room}</dd>
            </div>
            <div>
              <dt>Гость</dt>
              <dd>{order.guestName}</dd>
            </div>
            <div>
              <dt>Время заказа</dt>
              <dd>{dateTime(order.createdAt)}</dd>
            </div>
            <div>
              <dt>Оплата</dt>
              <dd>{PAYMENT_LABEL[order.payment]}</dd>
            </div>
            <div>
              <dt>Язык меню</dt>
              <dd>{LANG_LABEL[order.lang] ?? order.lang}</dd>
            </div>
            <div>
              <dt>Позиций</dt>
              <dd>{order.itemsCount}</dd>
            </div>
          </dl>

          {order.comment && (
            <div className="od-comment">
              <div className="od-section-title">Комментарий гостя</div>
              <p>{order.comment}</p>
            </div>
          )}

          <div className="od-section-title">Состав заказа</div>
          <table className="table od-items">
            <thead>
              <tr>
                <th>Блюдо</th>
                <th className="num">Кол-во</th>
                <th className="num">Цена</th>
                <th className="num">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    <div>{it.name}</div>
                    {it.category && <div className="muted small">{it.category}</div>}
                  </td>
                  <td className="num">{it.qty}</td>
                  <td className="num">{money(it.price)}</td>
                  <td className="num">{money(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Сумма</td>
                <td className="num">{money(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3}>Сервис ({Math.round(order.serviceRate * 100)}%)</td>
                <td className="num">{money(order.serviceFee)}</td>
              </tr>
              <tr className="od-total">
                <td colSpan={3}>К оплате</td>
                <td className="num">{money(order.total)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="od-section-title">История</div>
          <ol className="timeline">
            {timeline.map((s) => (
              <li key={s.label} className={s.tone ? `tl-${s.tone}` : ''}>
                <span className="tl-dot" aria-hidden />
                <span className="tl-label">{s.label}</span>
                <span className="tl-time">{time(s.at)}</span>
              </li>
            ))}
          </ol>
          {order.cancelReason && <p className="muted small">Причина отмены: {order.cancelReason}</p>}
          {order.handledBy && <p className="muted small">Последнее изменение: {order.handledBy}</p>}
        </>
      )}
    </Modal>
  );
}
