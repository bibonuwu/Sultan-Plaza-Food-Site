import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dateTime, money, PAYMENT_LABEL } from '../lib/format';
import type { Order } from '../types';

/** Чек для кухни / доставки (80 мм). Виден только при печати. */
export function PrintTicket({ order, onDone }: { order: Order | null; onDone: () => void }) {
  useEffect(() => {
    if (!order) return;
    const after = () => onDone();
    window.addEventListener('afterprint', after, { once: true });
    const id = window.setTimeout(() => window.print(), 50);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('afterprint', after);
    };
  }, [order, onDone]);

  if (!order) return null;
  return createPortal(
    <div className="print-ticket">
      <div className="pt-center pt-strong">SULTAN PLAZA HOTEL</div>
      <div className="pt-center">Room service</div>
      <hr />
      <div className="pt-big">Заказ №{order.number}</div>
      <div className="pt-big">Комната {order.room}</div>
      <div>Гость: {order.guestName}</div>
      <div>{dateTime(order.createdAt)}</div>
      <hr />
      {order.items.map((it, i) => (
        <div key={i} className="pt-row">
          <span>
            {it.qty} × {it.name}
          </span>
          <span>{money(it.price * it.qty)}</span>
        </div>
      ))}
      <hr />
      {order.comment && (
        <>
          <div className="pt-strong">Комментарий:</div>
          <div>{order.comment}</div>
          <hr />
        </>
      )}
      <div className="pt-row">
        <span>Сумма</span>
        <span>{money(order.subtotal)}</span>
      </div>
      <div className="pt-row">
        <span>Сервис {Math.round(order.serviceRate * 100)}%</span>
        <span>{money(order.serviceFee)}</span>
      </div>
      <div className="pt-row pt-strong">
        <span>ИТОГО</span>
        <span>{money(order.total)}</span>
      </div>
      <div>Оплата: {PAYMENT_LABEL[order.payment]}</div>
    </div>,
    document.body,
  );
}
