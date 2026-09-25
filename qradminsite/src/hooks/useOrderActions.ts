import { useCallback } from 'react';
import { auth } from '../firebase';
import { setOrderStatus } from '../lib/orders';
import { STATUS_META } from '../lib/format';
import { useToast } from '../components/Toast';
import type { Order, OrderStatus } from '../types';

/** Смена статуса заказа. Интерфейс обновляется сразу (локальный кэш Firestore), ошибки — тостом. */
export function useOrderActions() {
  const toast = useToast();
  return useCallback(
    (order: Order, status: OrderStatus, cancelReason?: string) => {
      const by = auth.currentUser?.email ?? '';
      setOrderStatus(order.id, status, by, cancelReason).catch((err) => {
        console.error(err);
        toast({
          tone: 'error',
          title: `Не удалось изменить заказ №${order.number}`,
          description:
            (err as { code?: string }).code === 'permission-denied'
              ? 'Нет прав на изменение. Обратитесь к администратору.'
              : 'Проверьте интернет и попробуйте ещё раз.',
        });
      });
      if (status === 'cancelled') toast({ tone: 'info', title: `Заказ №${order.number} отменён` });
      else if (status === 'done') toast({ tone: 'success', title: `Заказ №${order.number} выполнен` });
      else if (status === 'cooking' && order.status === 'new')
        toast({ tone: 'success', title: `Заказ №${order.number} принят`, description: STATUS_META.cooking.label });
    },
    [toast],
  );
}
