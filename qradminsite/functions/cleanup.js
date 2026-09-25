// Автоочистка базы: храним только последние N заказов, чтобы Firestore
// оставался в бесплатных лимитах. Активные заказы (ещё не доставленные) не удаляются.

const ACTIVE_STATUSES = new Set(['new', 'cooking', 'delivering']);

/**
 * Удаляет самые старые заказы сверх лимита.
 * @param {FirebaseFirestore.Firestore} db
 * @param {number} maxOrders сколько последних заказов оставить
 * @returns {Promise<number>} сколько заказов удалено
 */
export async function trimOldOrders(db, maxOrders) {
  const orders = db.collection('orders');
  // count() — дешёвый запрос: 1 чтение на каждую 1000 документов
  const total = (await orders.count().get()).data().count;
  const excess = total - maxOrders;
  if (excess <= 0) return 0;

  // Берём с запасом: если среди старых есть активные, их пропускаем
  const oldest = await orders
    .orderBy('createdAt', 'asc')
    .limit(excess + 20)
    .get();
  const victims = oldest.docs.filter((d) => !ACTIVE_STATUSES.has(d.get('status'))).slice(0, excess);
  if (!victims.length) return 0;

  for (let i = 0; i < victims.length; i += 450) {
    const batch = db.batch();
    victims.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return victims.length;
}
