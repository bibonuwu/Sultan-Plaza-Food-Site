/*!
 * menu_i18n_fix.js — заглушка
 *
 * Все переводы категорий и блюд теперь хранятся в menu.js (объект i18n).
 * Этот файл оставлен для совместимости: если app.js вызывает
 * fixMenuTranslations(), функция просто возвращает данные без изменений.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.fixMenuTranslations = factory().fixMenuTranslations;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Заглушка: возвращает переданные категории и позиции без изменений.
   * Реальные переводы берутся из menu.js → i18n.
   */
  function fixMenuTranslations(categories, items) {
    return { categories: categories, items: items };
  }

  return { fixMenuTranslations: fixMenuTranslations };
});
