import { memo } from 'react';
import { ChevronRight, DoorOpen, MessageSquareText, User } from 'lucide-react';
import { elapsed, minutesSince, money, PAYMENT_LABEL, STATUS_META, time } from '../lib/format';
import { NEW_ORDER_WARN_MINUTES } from '../config';
import { StatusBadge } from './ui';
import type { Order } from '../types';

const MAX_LINES = 5;

interface Props {
  order: Order;
  now: number;
  onOpen: (id: string) => void;
  onAdvance: (order: Order) => void;
}

function OrderCardImpl({ order, now, onOpen, onAdvance }: Props) {
  const meta = STATUS_META[order.status];
  const late = order.status === 'new' && minutesSince(order.createdAt, now) >= NEW_ORDER_WARN_MINUTES;
  const hidden = order.items.length - MAX_LINES;

  return (
    <article
      className={`order-card st-${order.status} ${late ? 'is-late' : ''}`}
      onClick={() => onOpen(order.id)}
      aria-label={`Заказ №${order.number}, комната ${order.room}, ${meta.label}`}
    >
      <header className="oc-head">
        <span className="oc-number">№{order.number}</span>
        <StatusBadge status={order.status} />
        <time className={`oc-time ${late ? 'is-late' : ''}`} dateTime={order.createdAt?.toISOString()}>
          {time(order.createdAt)} · {elapsed(order.createdAt, now)}
        </time>
      </header>

      <div className="oc-who">
        <span className="oc-room">
          <DoorOpen size={18} aria-hidden />
          Комната <strong>{order.room}</strong>
        </span>
        <span className="oc-guest">
          <User size={16} aria-hidden />
          {order.guestName}
        </span>
      </div>

      <ul className="oc-items">
        {order.items.slice(0, MAX_LINES).map((it, idx) => (
          <li key={idx}>
            <span className="oc-qty">{it.qty}×</span>
            <span className="oc-name">{it.name}</span>
            <span className="oc-sum">{money(it.price * it.qty)}</span>
          </li>
        ))}
        {hidden > 0 && <li className="oc-more">+ ещё {hidden} поз.</li>}
      </ul>

      {order.comment && (
        <p className="oc-comment">
          <MessageSquareText size={16} aria-hidden />
          <span>{order.comment}</span>
        </p>
      )}

      <footer className="oc-foot">
        <div className="oc-total">
          <span className="chip">{PAYMENT_LABEL[order.payment]}</span>
          <strong>{money(order.total)}</strong>
        </div>
        <div className="oc-actions">
          {meta.next && (
            <button
              type="button"
              className={`btn ${order.status === 'new' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={(e) => {
                e.stopPropagation();
                onAdvance(order);
              }}
            >
              {meta.action}
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            aria-label={`Подробнее о заказе №${order.number}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(order.id);
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </footer>
    </article>
  );
}

export const OrderCard = memo(OrderCardImpl);
