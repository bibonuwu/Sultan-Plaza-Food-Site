/* ===== app.js — меню Sultan Plaza =====
 * Данные берутся из menu.js (MENU, BAR, i18n).
 * Один и тот же файл для RestoMenu (день) и RestoMenunight (ночь):
 *  - кухня: категории в порядке MENU;
 *  - бар: группы из BAR_GROUPS; категории BAR, не попавшие в группы,
 *    автоматически добавляются в конец.
 * Сохранённый чек пишется в localStorage 'sp_receipts' — его читает admin.html.
 *
 * Скорость на слабых планшетах:
 *  - меню собирается строкой и вставляется пачками по кадрам;
 *  - «+» / «−» меняют только одну карточку, а не всё меню;
 *  - клики обрабатываются делегированием (без onclick на каждой карточке).
 * ===================================== */
(function () {
  'use strict';

  if (typeof MENU === 'undefined' || typeof BAR === 'undefined') {
    console.error('menu.js не загружен! Подключите <script src="menu.js"> перед app.js.');
    return;
  }

  /* ---------- Настройки ---------- */

  // Группы бара: верхние фильтры, объединяющие подкатегории BAR.
  var BAR_GROUPS = [
    { id: 'bar-soft', ids: ['bar-drinks', 'bar-water', 'bar-fresh'], ru: 'Вода и напитки', kz: 'Су және сусындар', en: 'Water & drinks' },
    { id: 'bar-hot-drinks', ids: ['bar-teas', 'bar-auth-teas', 'bar-tea-addons', 'bar-coffee'], ru: 'Чай и кофе', kz: 'Шай және кофе', en: 'Tea & coffee' },
    { id: 'bar-nonalc', ids: ['bar-nonalc-cocktails', 'bar-lemonades'], ru: 'Лимонады и б/а коктейли', kz: 'Лимонад және б/а коктейльдер', en: 'Lemonades & mocktails' },
    { id: 'bar-alc-mix', ids: ['bar-alc-cocktails', 'bar-aperitifs'], ru: 'Алк. коктейли и аперитивы', kz: 'Алк. коктейльдер және аперитивтер', en: 'Cocktails & aperitifs' },
    { id: 'bar-beer-all', ids: ['bar-beer-bottled', 'bar-beer-draft', 'bar-beer-snacks'], ru: 'Пиво и закуски', kz: 'Сыра және тіскебасар', en: 'Beer & snacks' },
    { id: 'bar-cognac-liquers', ids: ['bar-cognac-fr', 'bar-cognac-am', 'bar-cognac-kz', 'bar-liquers'], ru: 'Коньяк и ликёры', kz: 'Коньяк және ликерлер', en: 'Cognac & liqueurs' },
    { id: 'bar-spirits', ids: ['bar-vodka', 'bar-gin', 'bar-tequila', 'bar-rum'], ru: 'Водка / Джин / Текила / Ром', kz: 'Арақ / Джин / Текила / Ром', en: 'Vodka / Gin / Tequila / Rum' },
    { id: 'bar-whisky', ids: ['bar-scotch', 'bar-single-malt', 'bar-jameson', 'bar-bourbon'], ru: 'Виски и бурбон', kz: 'Виски және бурбон', en: 'Whisky & bourbon' },
    { id: 'bar-wines-spain', ids: ['bar-wine-spain-red', 'bar-wine-spain-white'], ru: '🇪🇸 Испания — Вина', kz: '🇪🇸 Испания — Шараптар', en: '🇪🇸 Spain — Wines' },
    { id: 'bar-wines-italy', ids: ['bar-wine-italy-red', 'bar-wine-italy-white'], ru: '🇮🇹 Италия — Вина', kz: '🇮🇹 Италия — Шараптар', en: '🇮🇹 Italy — Wines' },
    { id: 'bar-wines-nz', ids: ['bar-wine-nz-red', 'bar-wine-nz-white'], ru: '🇳🇿 Новая Зеландия — Вина', kz: '🇳🇿 Жаңа Зеландия — Шараптар', en: '🇳🇿 New Zealand — Wines' },
    { id: 'bar-wines-france', ids: ['bar-wine-france-red', 'bar-wine-france-white'], ru: '🇫🇷 Франция — Вина', kz: '🇫🇷 Франция — Шараптар', en: '🇫🇷 France — Wines' },
    { id: 'bar-wines-georgia', ids: ['bar-wine-georgia-red', 'bar-wine-georgia-white'], ru: '🇬🇪 Грузия — Вина', kz: '🇬🇪 Грузия — Шараптар', en: '🇬🇪 Georgia — Wines' },
    { id: 'bar-wines-chile', ids: ['bar-wine-chile-red', 'bar-wine-chile-white'], ru: '🇨🇱 Чили — Вина', kz: '🇨🇱 Чили — Шараптар', en: '🇨🇱 Chile — Wines' },
    { id: 'bar-wines-austria', ids: ['bar-wine-austria-red', 'bar-wine-austria-white'], ru: '🇦🇹 Австрия — Вина', kz: '🇦🇹 Австрия — Шараптар', en: '🇦🇹 Austria — Wines' },
    { id: 'bar-wines-australia', ids: ['bar-wine-australia-red', 'bar-wine-australia-white'], ru: '🇦🇺 Австралия — Вина', kz: '🇦🇺 Австралия — Шараптар', en: '🇦🇺 Australia — Wines' },
    { id: 'bar-wines-germany', ids: ['bar-wine-germany-red', 'bar-wine-germany-white'], ru: '🇩🇪 Германия — Вина', kz: '🇩🇪 Германия — Шараптар', en: '🇩🇪 Germany — Wines' },
    { id: 'bar-sparkling', ids: ['bar-sparkling'], ru: '🍾 Игристые вина', kz: '🍾 Газдалған шараптар', en: '🍾 Sparkling wines' },
    { id: 'bar-tobacco', ids: ['bar-cigarettes'], ru: 'Табачные изделия', kz: 'Темекі өнімдері', en: 'Tobacco items' }
  ];

  // Иконки категорий.
  var FILTER_ICON = {
    all: '✨',
    cold: '🥗',
    'hot-app': '🔥',
    beer: '🍺',
    salads: '🥗',
    'warm-salads': '🥘',
    soups: '🍲',
    main: '🍽️',
    pasta: '🍝',
    korean: '🇰🇷',
    'k-salads': '🥗',
    'grill-meat': '🥩',
    'grill-fish': '🐟',
    'hot-main': '🍛',
    bird: '🍗',
    pizza: '🍕',
    burgers: '🍔',
    kids: '🧒',
    breakfast: '🍳',
    preorder: '📦',
    sides: '🍟',
    desserts: '🍰',
    bread: '🥖',
    'bar-soft': '🥤',
    'bar-hot-drinks': '☕️',
    'bar-nonalc': '🧊',
    'bar-alc-mix': '🍸',
    'bar-beer-all': '🍺',
    'bar-cognac-liquers': '🥃',
    'bar-spirits': '🥃',
    'bar-whisky': '🥃',
    'bar-wines-spain': '🇪🇸',
    'bar-wines-italy': '🇮🇹',
    'bar-wines-nz': '🇳🇿',
    'bar-wines-france': '🇫🇷',
    'bar-wines-georgia': '🇬🇪',
    'bar-wines-chile': '🇨🇱',
    'bar-wines-austria': '🇦🇹',
    'bar-wines-australia': '🇦🇺',
    'bar-wines-germany': '🇩🇪',
    'bar-sparkling': '🍾',
    'bar-tobacco': '🚬'
  };

  var SERVICE = typeof SERVICE_RATE === 'number' ? SERVICE_RATE : 0.15;
  var RECEIPTS_KEY = 'sp_receipts';
  var FIRST_BATCH = 12; // карточек в первом кадре (≈ один экран планшета)
  var BATCH = 24;       // карточек в каждом следующем кадре

  var TEXT = {
    ru: {
      title: 'Меню',
      searchPh: 'Поиск блюд и напитков',
      clearSearch: 'Очистить поиск',
      tabMenu: 'Кухня',
      tabBar: 'Бар',
      all: 'Все',
      allFood: 'Все блюда',
      allBar: 'Все напитки',
      add: 'Добавить',
      less: 'Меньше',
      more: 'Больше',
      order: 'Ваш заказ',
      cartTitle: 'Ваш заказ',
      subtotal: 'Сумма',
      service: 'Обслуживание',
      total: 'Итого',
      save: 'Сохранить чек',
      clear: 'Очистить',
      clearConfirm: 'Точно очистить?',
      saved: 'Чек сохранён',
      saveError: 'Не удалось сохранить чек',
      cleared: 'Заказ очищен',
      emptyTitle: 'Ничего не найдено',
      emptyHint: 'Попробуйте другое название',
      resetSearch: 'Сбросить поиск',
      toTop: 'Наверх',
      close: 'Закрыть',
      langGroup: 'Язык'
    },
    kz: {
      title: 'Мәзір',
      searchPh: 'Тағамдар мен сусындарды іздеу',
      clearSearch: 'Іздеуді тазалау',
      tabMenu: 'Асхана',
      tabBar: 'Бар',
      all: 'Барлығы',
      allFood: 'Барлық тағамдар',
      allBar: 'Барлық сусындар',
      add: 'Қосу',
      less: 'Азайту',
      more: 'Көбейту',
      order: 'Тапсырысыңыз',
      cartTitle: 'Тапсырысыңыз',
      subtotal: 'Сомасы',
      service: 'Қызмет көрсету',
      total: 'Барлығы',
      save: 'Чекті сақтау',
      clear: 'Тазалау',
      clearConfirm: 'Тазалайсыз ба?',
      saved: 'Чек сақталды',
      saveError: 'Чекті сақтау мүмкін болмады',
      cleared: 'Тапсырыс тазаланды',
      emptyTitle: 'Ештеңе табылмады',
      emptyHint: 'Басқа атауды жазып көріңіз',
      resetSearch: 'Іздеуді тазалау',
      toTop: 'Жоғары',
      close: 'Жабу',
      langGroup: 'Тіл'
    },
    en: {
      title: 'Menu',
      searchPh: 'Search dishes & drinks',
      clearSearch: 'Clear search',
      tabMenu: 'Menu',
      tabBar: 'Bar',
      all: 'All',
      allFood: 'All dishes',
      allBar: 'All drinks',
      add: 'Add',
      less: 'Less',
      more: 'More',
      order: 'Your order',
      cartTitle: 'Your order',
      subtotal: 'Subtotal',
      service: 'Service',
      total: 'Total',
      save: 'Save receipt',
      clear: 'Clear',
      clearConfirm: 'Clear order?',
      saved: 'Receipt saved',
      saveError: 'Could not save receipt',
      cleared: 'Order cleared',
      emptyTitle: 'Nothing found',
      emptyHint: 'Try a different name',
      resetSearch: 'Clear search',
      toTop: 'Back to top',
      close: 'Close',
      langGroup: 'Language'
    }
  };

  var ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

  /* ---------- Данные: MENU + BAR → позиции и группы ---------- */

  var I18N_MENU = (typeof i18n !== 'undefined' && i18n && i18n.menu) || {};
  var CAT_NAMES = I18N_MENU.categories || {};

  function pick(map, lang, fallback) {
    if (!map) return fallback;
    if (lang === 'kz') return map.kk || map.kz || fallback;
    return map[lang] || fallback;
  }

  function langs(map, fallback) {
    return { ru: pick(map, 'ru', fallback), kz: pick(map, 'kz', fallback), en: pick(map, 'en', fallback) };
  }

  // «Испания — Красные вина» → «Красные вина» (страна уже в заголовке группы)
  function stripPrefix(label) {
    var i = label.lastIndexOf(' — ');
    return i >= 0 ? label.slice(i + 3) : label;
  }

  var itemById = {};
  var nextId = 1;

  function makeItems(cat) {
    var names = (I18N_MENU.items && I18N_MENU.items[cat.id]) || {};
    var descs = (I18N_MENU.descs && I18N_MENU.descs[cat.id]) || {};
    var wine = /-red$/.test(cat.id) ? 'red' : /-white$/.test(cat.id) ? 'white' : '';
    return (cat.items || []).map(function (raw) {
      var d = raw.d || '';
      var item = {
        id: String(nextId++),
        name: langs(names[raw.n], raw.n),
        desc: langs(d ? descs[d] : null, d),
        price: Number(raw.p) || 0,
        wine: wine
      };
      item.search = [item.name.ru, item.name.kz, item.name.en, item.desc.ru, item.desc.kz, item.desc.en].join(' ').toLowerCase();
      itemById[item.id] = item;
      return item;
    });
  }

  function makeGroup(id, label, parts) {
    var all = [];
    var tones = {};
    parts.forEach(function (p) {
      all = all.concat(p.items);
      p.items.forEach(function (it) { tones[it.wine || 'none'] = true; });
    });
    var keys = Object.keys(tones);
    return { id: id, label: label, parts: parts, items: all, tone: keys.length === 1 && keys[0] !== 'none' ? keys[0] : '' };
  }

  var GROUPS = { category: [], bar: [] };

  MENU.forEach(function (cat) {
    var list = makeItems(cat);
    if (list.length) GROUPS.category.push(makeGroup(cat.id, langs(CAT_NAMES[cat.id], cat.name), [{ title: null, items: list }]));
  });

  var barParts = {};
  BAR.forEach(function (cat) {
    var label = langs(CAT_NAMES[cat.id], cat.name);
    barParts[cat.id] = {
      title: { ru: stripPrefix(label.ru), kz: stripPrefix(label.kz), en: stripPrefix(label.en) },
      items: makeItems(cat)
    };
  });

  var usedBarCats = {};
  BAR_GROUPS.forEach(function (g) {
    var parts = [];
    g.ids.forEach(function (cid) {
      if (!barParts[cid]) return;
      usedBarCats[cid] = true;
      if (barParts[cid].items.length) parts.push(barParts[cid]);
    });
    if (parts.length) GROUPS.bar.push(makeGroup(g.id, { ru: g.ru, kz: g.kz, en: g.en }, parts));
  });
  BAR.forEach(function (cat) {
    if (usedBarCats[cat.id] || !barParts[cat.id].items.length) return;
    GROUPS.bar.push(makeGroup(cat.id, langs(CAT_NAMES[cat.id], cat.name), [barParts[cat.id]]));
  });

  /* ---------- Состояние и DOM ---------- */

  var state = { lang: 'ru', tab: 'category', filter: { category: 'all', bar: 'all' }, query: '' };
  var cart = {}; // { id: qty }

  function byId(id) { return document.getElementById(id); }

  var el = {
    header: byId('app-header'),
    tabs: byId('top-tabs'),
    chips: byId('category-filters'),
    langs: byId('lang-switch'),
    search: byId('search-input'),
    searchClear: byId('search-clear'),
    menu: byId('menu-container'),
    orderBtn: byId('order-btn'),
    orderCount: byId('order-count'),
    orderTotal: byId('order-total'),
    modal: byId('cart-modal'),
    cartList: byId('cart-items-list'),
    saveBtn: byId('btn-save-receipt'),
    clearBtn: byId('btn-clear-cart'),
    toTop: byId('scroll-top-btn'),
    toasts: byId('toast-container')
  };

  /* ---------- Утилиты ---------- */

  var raf = window.requestAnimationFrame
    ? function (fn) { return window.requestAnimationFrame(fn); }
    : function (fn) { return setTimeout(fn, 16); };

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ESC[c]; });
  }

  var numberFormat = null;
  try { numberFormat = new Intl.NumberFormat('ru-RU'); } catch (e) { /* старый браузер */ }
  function fmt(v) {
    return numberFormat ? numberFormat.format(v) : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function priceHtml(v) { return fmt(v) + '<span class="cur">₸</span>'; }
  function priceText(v) { return fmt(v) + ' ₸'; }

  function tx() { return TEXT[state.lang] || TEXT.ru; }

  function setText(id, value) {
    var node = byId(id);
    if (node) node.textContent = value;
  }

  function closest(node, selector) {
    if (node && node.nodeType === 3) node = node.parentNode;
    return node && node.closest ? node.closest(selector) : null;
  }

  // Перезапуск CSS-анимации без принудительного reflow: чередуем два одинаковых класса.
  function replay(node, a, b) {
    if (node.classList.contains(a)) {
      node.classList.remove(a);
      node.classList.add(b);
    } else {
      node.classList.remove(b);
      node.classList.add(a);
    }
  }

  function scrollY() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function smoothScrollTo(node, opts) {
    if ('scrollBehavior' in document.documentElement.style && node.scrollTo) {
      opts.behavior = 'smooth';
      node.scrollTo(opts);
    } else if (node === window) {
      window.scrollTo(opts.left || 0, opts.top || 0);
    } else if (typeof opts.left === 'number') {
      node.scrollLeft = opts.left;
    }
  }

  /* ---------- Верхние вкладки, категории ---------- */

  function groupsOf(tab) { return GROUPS[tab] || []; }

  function iconFor(id) {
    return FILTER_ICON[id] || (String(id).indexOf('bar-') === 0 ? '🍸' : '🍽️');
  }

  function markActiveTab() {
    el.tabs.setAttribute('data-active', state.tab);
    var btns = el.tabs.querySelectorAll('.top-tab');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-tab') === state.tab;
      btns[i].classList.toggle('active', on);
      btns[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  function chipHtml(id, label, sub) {
    var icon = iconFor(id);
    // у вин флаг уже в названии — не дублируем
    if (label.indexOf(icon) === 0) label = label.slice(icon.length).replace(/^\s+/, '');
    return '<button type="button" class="chip" data-filter="' + esc(id) + '" aria-pressed="false">' +
      '<span class="chip-title"><span class="chip-ico" aria-hidden="true">' + icon + '</span>' +
      '<span class="chip-text">' + esc(label) + '</span></span>' +
      (sub ? '<span class="chip-sub">' + esc(sub) + '</span>' : '') +
      '</button>';
  }

  function renderChips() {
    var t = tx();
    var lang = state.lang;
    var html = chipHtml('all', t.all, state.tab === 'bar' ? t.allBar : t.allFood);
    groupsOf(state.tab).forEach(function (g) {
      var sample = g.items.slice(0, 2).map(function (it) { return it.name[lang]; }).join(' · ');
      html += chipHtml(g.id, g.label[lang], sample);
    });
    el.chips.innerHTML = html;
    el.chips.classList.toggle('is-searching', !!state.query);
    markActiveChip(false);
  }

  function markActiveChip(smooth) {
    var active = state.filter[state.tab];
    var chips = el.chips.children;
    for (var i = 0; i < chips.length; i++) {
      var on = chips[i].getAttribute('data-filter') === active;
      chips[i].classList.toggle('active', on);
      chips[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    revealActiveChip(smooth);
  }

  // Прокручивает ряд категорий к активной. Размеры читаются в следующем кадре,
  // чтобы не заставлять браузер пересчитывать страницу посреди перерисовки меню.
  var chipRevealQueued = false;
  var chipRevealSmooth = false;

  function revealActiveChip(smooth) {
    chipRevealSmooth = smooth;
    if (chipRevealQueued) return;
    chipRevealQueued = true;
    raf(function () {
      chipRevealQueued = false;
      var target = el.chips.querySelector('.chip.active');
      if (!target) return;
      var box = el.chips;
      var left = target.offsetLeft - (box.clientWidth - target.offsetWidth) / 2;
      left = Math.max(0, Math.min(left, box.scrollWidth - box.clientWidth));
      if (chipRevealSmooth) smoothScrollTo(box, { left: left });
      else box.scrollLeft = left;
    });
  }

  /* ---------- Меню ---------- */

  function actionHtml(qty) {
    var t = tx();
    if (!qty) {
      return '<button type="button" class="btn-add" data-act="add"><span class="plus" aria-hidden="true"></span>' + esc(t.add) + '</button>';
    }
    return stepperHtml(qty, 'stepper');
  }

  function stepperHtml(qty, cls) {
    var t = tx();
    return '<div class="' + cls + '">' +
      '<button type="button" data-act="dec" aria-label="' + esc(t.less) + '">−</button>' +
      '<span class="stepper-val">' + qty + '</span>' +
      '<button type="button" data-act="inc" aria-label="' + esc(t.more) + '">+</button>' +
      '</div>';
  }

  function cardHtml(item) {
    var lang = state.lang;
    var qty = cart[item.id] || 0;
    var desc = item.desc[lang];
    return '<article class="card' + (qty ? ' in-cart' : '') + (item.wine ? ' wine-' + item.wine : '') + '" data-id="' + item.id + '">' +
      '<div class="card-body"><h4 class="card-title">' + esc(item.name[lang]) + '</h4>' +
      (desc ? '<p class="card-desc">' + esc(desc) + '</p>' : '') + '</div>' +
      '<div class="card-footer"><span class="card-price">' + priceHtml(item.price) + '</span>' +
      '<span class="card-action">' + actionHtml(qty) + '</span></div>' +
      '</article>';
  }

  function sectionHtml(sec) {
    var lang = state.lang;
    var g = sec.group;
    var html = '<section class="menu-section' + (g.tone ? ' tone-' + g.tone : '') + '" data-group="' + esc(g.id) + '">' +
      '<h3 class="section-title"><span>' + esc(g.label[lang]) + '</span></h3>' +
      '<div class="section-grid">';
    sec.parts.forEach(function (p) {
      if (p.title) html += '<div class="sub-title">' + esc(p.title[lang]) + '</div>';
      for (var i = 0; i < p.items.length; i++) html += cardHtml(p.items[i]);
    });
    return html + '</div></section>';
  }

  function matches(item, q) { return item.search.indexOf(q) !== -1; }

  function buildSections(tab, filter, q) {
    var out = [];
    groupsOf(tab).forEach(function (g) {
      if (filter !== 'all' && g.id !== filter) return;
      var parts = [];
      var count = 0;
      g.parts.forEach(function (p) {
        var list = q ? p.items.filter(function (it) { return matches(it, q); }) : p.items;
        if (list.length) {
          parts.push({ title: p.title, items: list });
          count += list.length;
        }
      });
      if (count) out.push({ group: g, parts: parts, count: count });
    });
    return out;
  }

  function countMatches(tab, q) {
    var n = 0;
    groupsOf(tab).forEach(function (g) {
      g.items.forEach(function (it) { if (matches(it, q)) n++; });
    });
    return n;
  }

  function emptyHtml() {
    var t = tx();
    return '<div class="empty"><div class="empty-ico">' + ICON_SEARCH + '</div>' +
      '<div class="empty-title">' + esc(t.emptyTitle) + '</div>' +
      '<div class="empty-hint">' + esc(t.emptyHint) + '</div>' +
      (state.query ? '<button type="button" class="btn btn-outline" data-act="reset-search">' + esc(t.resetSearch) + '</button>' : '') +
      '</div>';
  }

  var renderToken = 0;

  function renderMenu(animate) {
    var token = ++renderToken;
    var filter = state.query ? 'all' : state.filter[state.tab];
    var sections = buildSections(state.tab, filter, state.query);
    var i = 0;

    function nextChunk(budget) {
      var html = '';
      var count = 0;
      while (i < sections.length && (count === 0 || count + sections[i].count <= budget)) {
        html += sectionHtml(sections[i]);
        count += sections[i].count;
        i++;
      }
      return html;
    }

    el.menu.innerHTML = sections.length ? nextChunk(FIRST_BATCH) : emptyHtml();
    if (animate) replay(el.menu, 'enter-a', 'enter-b');

    // остальное — по кадрам, чтобы первый экран появился сразу
    (function pump() {
      if (i >= sections.length) return;
      raf(function () {
        if (token !== renderToken) return;
        el.menu.insertAdjacentHTML('beforeend', nextChunk(BATCH));
        pump();
      });
    })();
  }

  // Если пользователь ниже начала меню — поднимаем к первой секции (до перерисовки).
  function scrollToMenuStart() {
    var y = scrollY();
    var top = el.menu.getBoundingClientRect().top + y - el.header.offsetHeight;
    if (y > top) window.scrollTo(0, Math.max(0, top));
  }

  // Порядок везде один: сначала читаем размеры (scrollToMenuStart), потом меняем DOM —
  // так браузер считает раскладку один раз за кадр.
  function setTab(tab) {
    if (tab === state.tab || !GROUPS[tab]) return;
    state.tab = tab;
    scrollToMenuStart();
    markActiveTab();
    renderChips();
    renderMenu(true);
  }

  function setFilter(id) {
    var hadQuery = !!state.query;
    if (hadQuery) clearQuery();
    if (id === state.filter[state.tab] && !hadQuery) {
      scrollToMenuStart();
      return;
    }
    state.filter[state.tab] = id;
    scrollToMenuStart();
    markActiveChip(true);
    renderMenu(true);
  }

  /* ---------- Поиск ---------- */

  var searchTimer = 0;

  function clearQuery() {
    clearTimeout(searchTimer);
    el.search.value = '';
    el.searchClear.hidden = true;
    state.query = '';
    el.chips.classList.remove('is-searching');
  }

  function applySearch() {
    var q = el.search.value.replace(/^\s+|\s+$/g, '').toLowerCase();
    if (q === state.query) return;
    state.query = q;
    // нет совпадений во вкладке, но есть в соседней — переключаемся
    if (q && !countMatches(state.tab, q)) {
      var other = state.tab === 'bar' ? 'category' : 'bar';
      if (countMatches(other, q)) {
        state.tab = other;
        markActiveTab();
        renderChips();
      }
    }
    el.chips.classList.toggle('is-searching', !!q);
    renderMenu(false);
  }

  function resetSearch(focus) {
    var had = !!state.query;
    clearQuery();
    if (had) renderMenu(true);
    if (focus) el.search.focus();
  }

  /* ---------- Язык ---------- */

  function applyStaticText() {
    var t = tx();
    document.title = 'Sultan Plaza — ' + t.title;
    el.search.placeholder = t.searchPh;
    el.search.setAttribute('aria-label', t.searchPh);
    el.searchClear.setAttribute('aria-label', t.clearSearch);
    el.toTop.setAttribute('aria-label', t.toTop);
    el.langs.setAttribute('aria-label', t.langGroup);
    byId('cart-close').setAttribute('aria-label', t.close);
    setText('tab-label-category', t.tabMenu);
    setText('tab-label-bar', t.tabBar);
    setText('order-label', t.order);
    setText('cart-title', t.cartTitle);
    setText('cart-subtotal-label', t.subtotal);
    setText('cart-service-label', t.service + ' ' + Math.round(SERVICE * 100) + '%');
    setText('cart-total-label', t.total);
    setText('btn-save-receipt-text', t.save);
    setText('btn-clear-cart-text', clearArmed ? t.clearConfirm : t.clear);
  }

  function setLang(lang) {
    if (!TEXT[lang] || lang === state.lang) return;
    state.lang = lang;
    var btns = el.langs.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-lang') === lang;
      btns[i].classList.toggle('active', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    applyStaticText();
    renderChips();
    renderMenu(true);
    if (sheetOpen) renderCart();
    // lang на <html> пересчитывает стили всей страницы — меняем после замены меню
    document.documentElement.lang = lang === 'kz' ? 'kk' : lang;
  }

  /* ---------- Заказ ---------- */

  function totals() {
    var subtotal = 0;
    var count = 0;
    Object.keys(cart).forEach(function (id) {
      var item = itemById[id];
      if (!item) return;
      subtotal += item.price * cart[id];
      count += cart[id];
    });
    var service = Math.round(subtotal * SERVICE);
    return { subtotal: subtotal, service: service, total: subtotal + service, count: count };
  }

  // Обновляет одну карточку на месте (без перерисовки меню).
  function syncCard(id) {
    var card = el.menu.querySelector('.card[data-id="' + id + '"]');
    if (!card) return;
    var qty = cart[id] || 0;
    var slot = card.querySelector('.card-action');
    var val = slot.querySelector('.stepper-val');
    card.classList.toggle('in-cart', qty > 0);
    if (qty > 0 && val) val.textContent = qty;
    else slot.innerHTML = actionHtml(qty);
  }

  function updateOrderBar(bump) {
    var tt = totals();
    document.body.classList.toggle('has-order', tt.count > 0);
    el.orderCount.textContent = tt.count;
    el.orderTotal.innerHTML = priceHtml(tt.subtotal);
    if (bump && tt.count) replay(el.orderCount, 'bump-a', 'bump-b');
  }

  function changeQty(id, delta) {
    if (!itemById[id]) return;
    var qty = (cart[id] || 0) + delta;
    if (qty > 0) cart[id] = qty;
    else delete cart[id];
    syncCard(id);
    updateOrderBar(delta > 0);
    if (sheetOpen) {
      if (totals().count) renderCart();
      else closeCart();
    }
  }

  function emptyCart() {
    var ids = Object.keys(cart);
    cart = {};
    ids.forEach(syncCard);
    updateOrderBar(false);
  }

  /* ---------- Окно заказа ---------- */

  var sheetOpen = false;
  var sheetTimer = 0;

  function renderCart() {
    var lang = state.lang;
    var html = '';
    Object.keys(cart).forEach(function (id) {
      var item = itemById[id];
      if (!item) return;
      var qty = cart[id];
      html += '<div class="cart-row" data-id="' + id + '">' +
        '<div class="cart-row-info"><div class="cart-row-name">' + esc(item.name[lang]) + '</div>' +
        '<div class="cart-row-meta">' + priceText(item.price) + '</div></div>' +
        stepperHtml(qty, 'stepper stepper-sm') +
        '<div class="cart-row-total">' + priceHtml(item.price * qty) + '</div>' +
        '</div>';
    });
    el.cartList.innerHTML = html;
    var tt = totals();
    setText('cart-subtotal', priceText(tt.subtotal));
    setText('cart-service-amount', priceText(tt.service));
    byId('cart-total-price').innerHTML = priceHtml(tt.total);
  }

  function openCart() {
    if (!totals().count) return;
    renderCart();
    clearTimeout(sheetTimer);
    sheetOpen = true;
    el.modal.hidden = false;
    void el.modal.offsetWidth; // стартовое состояние для анимации
    el.modal.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeCart() {
    if (!sheetOpen) return;
    sheetOpen = false;
    el.modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    resetClearBtn();
    sheetTimer = setTimeout(function () { el.modal.hidden = true; }, 450);
  }

  function saveReceipt() {
    var tt = totals();
    if (!tt.count) return;
    var items = [];
    Object.keys(cart).forEach(function (id) {
      var item = itemById[id];
      if (item) items.push({ name: item.name.ru, qty: cart[id], price: item.price, total: item.price * cart[id] });
    });
    var receipt = {
      id: 'rec_' + Date.now(),
      date: new Date().toISOString(),
      menuMode: document.body.getAttribute('data-menu-mode') || (/RestoMenunight/i.test(location.pathname) ? 'night' : 'day'),
      items: items,
      subtotal: tt.subtotal,
      service: tt.service,
      total: tt.total
    };
    try {
      var saved = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || '[]');
      var receipts = Array.isArray(saved) ? saved : [];
      receipts.unshift(receipt);
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    } catch (e) {
      console.error('Receipt save error', e);
      showToast(tx().saveError, 'error');
      return;
    }
    closeCart();
    emptyCart();
    showNotice(tx().saved);
  }

  // «Очистить» — в два касания, чтобы не стереть заказ случайно.
  var clearArmed = false;
  var clearTimer = 0;

  function resetClearBtn() {
    clearTimeout(clearTimer);
    clearArmed = false;
    el.clearBtn.classList.remove('confirming');
    setText('btn-clear-cart-text', tx().clear);
  }

  function onClearClick() {
    if (!clearArmed) {
      clearArmed = true;
      el.clearBtn.classList.add('confirming');
      setText('btn-clear-cart-text', tx().clearConfirm);
      clearTimer = setTimeout(resetClearBtn, 3000);
      return;
    }
    closeCart();
    emptyCart();
    showToast(tx().cleared, 'success');
  }

  /* ---------- Уведомления ---------- */

  function showToast(message, type) {
    var node = document.createElement('div');
    node.className = 'toast' + (type ? ' ' + type : '');
    node.textContent = message;
    el.toasts.appendChild(node);
    setTimeout(function () {
      node.classList.add('out');
      setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 260);
    }, 2000);
  }

  var noticeTimer = 0;

  function showNotice(message) {
    var notice = byId('receipt-saved-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'receipt-saved-notice';
      notice.className = 'receipt-saved-notice';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      notice.innerHTML = '<span class="receipt-saved-icon" aria-hidden="true">✓</span><span class="receipt-saved-message"></span>';
      document.body.appendChild(notice);
    }
    notice.querySelector('.receipt-saved-message').textContent = message;
    clearTimeout(noticeTimer);
    notice.classList.remove('show');
    void notice.offsetWidth;
    notice.classList.add('show');
    noticeTimer = setTimeout(function () { notice.classList.remove('show'); }, 2800);
  }

  window.showToast = showToast;

  /* ---------- Кнопка «наверх» ---------- */

  var toTopShown = false;
  var scrollQueued = false;

  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    raf(function () {
      scrollQueued = false;
      var show = scrollY() > 700;
      if (show !== toTopShown) {
        toTopShown = show;
        el.toTop.classList.toggle('visible', show);
      }
    });
  }

  /* ---------- События ---------- */

  el.tabs.addEventListener('click', function (e) {
    var btn = closest(e.target, '.top-tab');
    if (btn) setTab(btn.getAttribute('data-tab'));
  });

  el.chips.addEventListener('click', function (e) {
    var chip = closest(e.target, '.chip');
    if (chip) setFilter(chip.getAttribute('data-filter'));
  });

  el.langs.addEventListener('click', function (e) {
    var btn = closest(e.target, '.lang-btn');
    if (btn) setLang(btn.getAttribute('data-lang'));
  });

  el.menu.addEventListener('click', function (e) {
    var btn = closest(e.target, '[data-act]');
    if (!btn) return;
    var act = btn.getAttribute('data-act');
    if (act === 'reset-search') {
      resetSearch(true);
      return;
    }
    var card = closest(btn, '.card');
    if (card) changeQty(card.getAttribute('data-id'), act === 'dec' ? -1 : 1);
  });

  el.cartList.addEventListener('click', function (e) {
    var btn = closest(e.target, '[data-act]');
    var row = btn && closest(btn, '.cart-row');
    if (row) changeQty(row.getAttribute('data-id'), btn.getAttribute('data-act') === 'dec' ? -1 : 1);
  });

  el.search.addEventListener('input', function () {
    el.searchClear.hidden = !el.search.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applySearch, 140);
  });

  el.search.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      clearTimeout(searchTimer);
      applySearch();
      el.search.blur(); // спрятать клавиатуру
    } else if (e.key === 'Escape' || e.keyCode === 27) {
      resetSearch(false);
    }
  });

  el.searchClear.addEventListener('click', function () { resetSearch(true); });

  el.orderBtn.addEventListener('click', openCart);
  el.saveBtn.addEventListener('click', saveReceipt);
  el.clearBtn.addEventListener('click', onClearClick);

  el.modal.addEventListener('click', function (e) {
    if (e.target === el.modal || closest(e.target, '[data-close]')) closeCart();
  });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && sheetOpen) closeCart();
  });

  el.toTop.addEventListener('click', function () { smoothScrollTo(window, { top: 0 }); });
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Старт ---------- */

  applyStaticText();
  markActiveTab();
  renderChips();
  updateOrderBar(false);
  renderMenu(true);
})();
