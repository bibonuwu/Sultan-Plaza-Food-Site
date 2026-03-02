/* ===== app.js — логика приложения =====
 * Данные берутся из menu.js (MENU, BAR, i18n).
 * ========================================= */

// Объявляем переменные данных (будут заполнены из menu.js)
let rawCategories = [];
let menuItems = [];

// ---- Мост: конвертируем MENU + BAR → rawCategories + menuItems ----
(function buildFromMenuJs() {
  if (typeof MENU === 'undefined' || typeof BAR === 'undefined') {
    console.error('menu.js не загружен! Подключите <script src="menu.js"> перед app.js.');
    return;
  }

  function catName(id, fallback, lang) {
    const map = (typeof i18n !== 'undefined') && i18n.menu && i18n.menu.categories && i18n.menu.categories[id];
    if (!map) return fallback;
    if (lang === 'kz' || lang === 'kk') return map.kk || map.kz || fallback;
    if (lang === 'en') return map.en || fallback;
    return map.ru || fallback;
  }

  rawCategories = [{ id: 'all', ru: 'Все', kz: 'Барлығы', en: 'All' }];
  [...MENU, ...BAR].forEach(cat => {
    rawCategories.push({
      id: cat.id,
      ru: catName(cat.id, cat.name, 'ru'),
      kz: catName(cat.id, cat.name, 'kz'),
      en: catName(cat.id, cat.name, 'en')
    });
  });

  let itemId = 1;
  menuItems = [];
  [...MENU, ...BAR].forEach(cat => {
    cat.items.forEach(item => {
      const nameTrans = (typeof i18n !== 'undefined' && i18n.menu && i18n.menu.items &&
                         i18n.menu.items[cat.id] && i18n.menu.items[cat.id][item.n]) || {};
      const descKey   = item.d || '';
      const descTrans = (typeof i18n !== 'undefined' && i18n.menu && i18n.menu.descs &&
                         i18n.menu.descs[cat.id] && i18n.menu.descs[cat.id][descKey]) || {};
      menuItems.push({
        id:    itemId++,
        cat:   cat.id,
        ru:    nameTrans.ru  || item.n,
        kz:    nameTrans.kk  || nameTrans.kz || item.n,
        en:    nameTrans.en  || item.n,
        desc: {
          ru:  descTrans.ru  || descKey,
          kz:  descTrans.kk  || descTrans.kz || descKey,
          en:  descTrans.en  || descKey
        },
        price: item.p,
        img:   cat.img || ''
      });
    });
  });
})();

// ---- Далее вся оригинальная логика рендеринга и управления ----
        // --- State ---
        let currentLang = 'ru';
        let cart = {}; // { id: qty }
        let currentFilter = 'all';
        const categoryTaxonomy = Object.freeze({
            sides: { synonyms: ['side', 'garnish', 'sauce', 'соус', 'гарнир', 'fries', 'rice', 'puree', 'vegetable'] },
            soups: { synonyms: ['soup', 'broth', 'суп', 'сорпа'] },
            mains: { synonyms: ['main', 'entree', 'steak', 'cutlet', 'котлет', 'стейк', 'горяч'] },
            oriental: { synonyms: ['oriental', 'asian', 'wok', 'noodle', 'лапша', 'восточ'] },
            pizza: { synonyms: ['pizza', 'пицц'] },
            salads: { synonyms: ['salad', 'салат', 'caesar', 'оливье'] },
            cold: { synonyms: ['carpaccio', 'pate', 'pickles', 'plate', 'холод', 'карпаччо', 'паштет', 'солень'] },
            appetizers: { synonyms: ['appetizer', 'starter', 'snack', 'темпура', 'tempura', 'roll', 'закуск', 'наггет'] },
            kids: { synonyms: ['kids', 'children', 'детск', 'бала'] },
            other: { synonyms: [] }
        });
        const categoryAliasByLegacy = Object.freeze({
            "cold": "cold",
            "hot-app": "hot-app",
            "beer": "beer",
            "salads": "salads",
            "warm-salads": "warm-salads",
            "soups": "soups",
            "pasta": "pasta",
            "korean": "korean",
            "k-salads": "k-salads",
            "grill-meat": "grill-meat",
            "grill-fish": "grill-fish",
            "hot-main": "hot-main",
            "bird": "bird",
            "pizza": "pizza",
            "burgers": "burgers",
            "kids": "kids",
            "breakfast": "breakfast",
            "preorder": "preorder",
            "sides": "sides",
            "desserts": "desserts",
            "bread": "bread",
            "bar-drinks": "bar-drinks",
            "bar-water": "bar-water",
            "bar-teas": "bar-teas",
            "bar-auth-teas": "bar-auth-teas",
            "bar-tea-addons": "bar-tea-addons",
            "bar-alc-cocktails": "bar-alc-cocktails",
            "bar-cigarettes": "bar-cigarettes",
            "bar-nonalc-cocktails": "bar-nonalc-cocktails",
            "bar-lemonades": "bar-lemonades",
            "bar-fresh": "bar-fresh",
            "bar-coffee": "bar-coffee",
            "bar-liquers": "bar-liquers",
            "bar-cognac-fr": "bar-cognac-fr",
            "bar-cognac-am": "bar-cognac-am",
            "bar-cognac-kz": "bar-cognac-kz",
            "bar-beer-bottled": "bar-beer-bottled",
            "bar-beer-draft": "bar-beer-draft",
            "bar-beer-snacks": "bar-beer-snacks",
            "bar-vodka": "bar-vodka",
            "bar-white-wine-1": "bar-wines",
            "bar-wine-spain-red": "bar-wines",
            "bar-wine-spain-white": "bar-wines",
            "bar-wine-italy-red": "bar-wines",
            "bar-wine-italy-white": "bar-wines",
            "bar-wine-nz-red": "bar-wines",
            "bar-wine-nz-white": "bar-wines",
            "bar-wine-france-red": "bar-wines",
            "bar-wine-france-white": "bar-wines",
            "bar-wine-georgia-red": "bar-wines",
            "bar-wine-georgia-white": "bar-wines",
            "bar-wine-chile-white": "bar-wines",
            "bar-wine-chile-red": "bar-wines",
            "bar-wine-austria-red": "bar-wines",
            "bar-wine-austria-white": "bar-wines",
            "bar-wine-australia-red": "bar-wines",
            "bar-wine-australia-white": "bar-wines",
            "bar-wine-germany-red": "bar-wines",
            "bar-wine-germany-white": "bar-wines",
            "bar-scotch": "bar-scotch",
            "bar-single-malt": "bar-single-malt",
            "bar-jameson": "bar-jameson",
            "bar-bourbon": "bar-bourbon",
            "bar-red-wine-1": "bar-wines",
            "bar-white-wine-2": "bar-wines",
            "bar-red-wine-2": "bar-wines",
            "bar-aperitifs": "bar-aperitifs",
            "bar-sparkling": "bar-wines",
            "bar-tequila": "bar-tequila",
            "bar-gin": "bar-gin",
            "bar-rum": "bar-rum"
});

        function resolveCategoryByName(item) {
            const legacyCategory = categoryAliasByLegacy[item.cat];
            if (legacyCategory) return legacyCategory;

            const title = `${item.ru} ${item.kz} ${item.en}`.toLowerCase();
            for (const [categoryId, meta] of Object.entries(categoryTaxonomy)) {
                if (categoryId === 'other') continue;
                if (meta.synonyms.some(term => title.includes(term))) return categoryId;
            }
            return 'other';
        }

        menuItems.forEach(item => {
            item.filterCategory = resolveCategoryByName(item);
            item.filterName = `${item.ru} ${item.kz} ${item.en}`.toLowerCase();
        });

        const menuItemById = new Map(menuItems.map(item => [item.id, item]));
        const searchIndexById = new Map(
            menuItems.map(item => [
                item.id,
                item.filterName
            ])
        );
        const priceFormatter = new Intl.NumberFormat();
        const langButtons = Array.from(document.querySelectorAll('.lang-btn'));
        const ui = {
            searchInput: document.getElementById('search-input'),
            menuContainer: document.getElementById('menu-container'),
            filtersContainer: document.getElementById('category-filters'),
            orderBadge: document.getElementById('btn-order-badge'),
            cartItemsList: document.getElementById('cart-items-list'),
            cartTotalPrice: document.getElementById('cart-total-price'),
            cartModal: document.getElementById('cart-modal'),
            confirmModal: document.getElementById('confirm-modal')
        };
        const mobileMenuUi = {
            body: document.body,
            toggleBtn: document.getElementById('menu-toggle-btn'),
            panel: document.getElementById('menu-controls-panel'),
            backdrop: document.getElementById('menu-backdrop')
        };

        function isCompactMenuViewport() {
            return window.matchMedia('(max-width: 768px)').matches;
        }

        function setCompactMenuOpen(isOpen, options = {}) {
            const { restoreFocus = true } = options;
            const { body, toggleBtn, panel, backdrop } = mobileMenuUi;
            if (!body || !toggleBtn || !panel || !backdrop) return;

            const inCompactMode = body.classList.contains('mobile-menu-ready') && isCompactMenuViewport();
            const nextState = inCompactMode && isOpen;

            body.classList.toggle('mobile-menu-open', nextState);
            toggleBtn.setAttribute('aria-expanded', String(nextState));
            panel.setAttribute('aria-hidden', inCompactMode ? String(!nextState) : 'false');
            backdrop.hidden = !nextState;
            backdrop.setAttribute('aria-hidden', String(!nextState));
            if ('inert' in panel) panel.inert = inCompactMode ? !nextState : false;

            if (nextState) {
                if (ui.searchInput) ui.searchInput.focus();
            } else if (restoreFocus && inCompactMode) {
                toggleBtn.focus();
            }
        }

        function initCompactMenu() {
            const { body, toggleBtn, backdrop } = mobileMenuUi;
            if (!body || !toggleBtn || !backdrop) return;

            body.classList.add('mobile-menu-ready');
            toggleBtn.addEventListener('click', () => {
                const isOpen = body.classList.contains('mobile-menu-open');
                setCompactMenuOpen(!isOpen, { restoreFocus: false });
            });

            backdrop.addEventListener('click', () => {
                setCompactMenuOpen(false);
            });

            if (ui.filtersContainer) {
                ui.filtersContainer.addEventListener('click', event => {
                    if (!isCompactMenuViewport()) return;
                    if (!(event.target instanceof Element)) return;
                    if (event.target.closest('.chip')) {
                        setCompactMenuOpen(false, { restoreFocus: false });
                    }
                });
            }

            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && body.classList.contains('mobile-menu-open')) {
                    event.preventDefault();
                    setCompactMenuOpen(false);
                }
            });

            window.addEventListener('resize', () => {
                if (!isCompactMenuViewport()) {
                    setCompactMenuOpen(false, { restoreFocus: false });
                }
            });

            setCompactMenuOpen(false, { restoreFocus: false });
        }

        // --- Translations ---
        const translations = {
            ru: {
                brandDesc: 'BOROVOE HOTEL',
                searchPh: 'Поиск по меню...',
                orderBtn: 'Заказать',
                cartTitle: 'Ваш заказ',
                totalLabel: 'Итого:',
                checkoutBtn: 'Оформить',
                cancelBtn: 'Отмена',
                confirmTitle: 'Подтверждение',
                confirmMsg: 'Позвонить на 600 и оформить заказ?',
                confirmYes: 'Да, позвонить',
                confirmNo: 'Назад',
                addBtn: 'Добавить',
                callNoteTitle: 'Позвоните по внутренним номерам:',
                callReception: 'Ресепшн: 100',
                callRestaurant: 'Ресторан: 600'
            },
            kz: {
                brandDesc: 'BOROVOE HOTEL',
                searchPh: 'Мәзірден іздеу...',
                orderBtn: 'Тапсырыс беру',
                cartTitle: 'Тапсырысыңыз',
                totalLabel: 'Барлығы:',
                checkoutBtn: 'Рәсімдеу',
                cancelBtn: 'Болдырмау',
                confirmTitle: 'Растау',
                confirmMsg: '600 нөміріне хабарласып тапсырыс бересіз бе?',
                confirmYes: 'Иә, қоңырау',
                confirmNo: 'Артқа',
                addBtn: 'Қосу',
                callNoteTitle: 'Ішкі нөмірлерге қоңырау шалыңыз:',
                callReception: 'Ресепшн: 100',
                callRestaurant: 'Мейрамхана: 600'
            },
            en: {
                brandDesc: 'BOROVOE HOTEL',
                searchPh: 'Search menu...',
                orderBtn: 'Order',
                cartTitle: 'Your order',
                totalLabel: 'Total:',
                checkoutBtn: 'Checkout',
                cancelBtn: 'Cancel',
                confirmTitle: 'Confirmation',
                confirmMsg: 'Call 600 to place order?',
                confirmYes: 'Yes, Call',
                confirmNo: 'Back',
                addBtn: 'Add',
                callNoteTitle: 'Please call internal numbers:',
                callReception: 'Reception: 100',
                callRestaurant: 'Restaurant: 600'
            }
        };

        // --- Core Functions ---

        function formatPrice(value) {
            return `${priceFormatter.format(value)} ₸`;
        }

        function setTextIfPresent(id, value) {
            const element = document.getElementById(id);
            if (element) element.innerText = value;
        }

        function setLang(lang) {
            currentLang = lang;
            // Update UI buttons
            langButtons.forEach(btn => {
                const btnLang = (btn.dataset.lang || btn.innerText || '').trim().toLowerCase();
                btn.classList.toggle('active', btnLang === lang);
            });
            renderAll();
        }

        function renderAll() {
            renderFilters();
            renderMenu();
            updateUIStrings();
            updateBottomBar();
        }

        function updateUIStrings() {
            const t = translations[currentLang];
            setTextIfPresent('brand-desc', t.brandDesc);
            if (ui.searchInput) ui.searchInput.placeholder = t.searchPh;
            setTextIfPresent('btn-order-text', t.orderBtn);
            setTextIfPresent('cart-title', t.cartTitle);
            setTextIfPresent('cart-total-label', t.totalLabel);            setTextIfPresent('btn-cancel-text', t.cancelBtn);
            setTextIfPresent('confirm-title', t.confirmTitle);
            setTextIfPresent('confirm-message', t.confirmMsg);
            setTextIfPresent('btn-confirm-yes', t.confirmYes);
            setTextIfPresent('btn-confirm-no', t.confirmNo);
        
            setTextIfPresent('call-note-title', t.callNoteTitle);
            setTextIfPresent('call-reception', t.callReception);
            setTextIfPresent('call-restaurant', t.callRestaurant);
}

        function renderFilters() {
            const container = ui.filtersContainer;
            if (!container) return;
            container.innerHTML = '';
            rawCategories.forEach(cat => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `chip ${currentFilter === cat.id ? 'active' : ''}`;
                btn.innerText = cat[currentLang];
                btn.setAttribute('data-category', cat.id);
                btn.setAttribute('aria-pressed', String(currentFilter === cat.id));
                btn.onclick = () => {
                    currentFilter = cat.id;
                    renderFilters(); // re-render to update active class
                    renderMenu();
                };
                container.appendChild(btn);
            });
        }

        function renderMenu() {
            const container = ui.menuContainer;
            if (!container || !ui.searchInput) return;

            const searchVal = ui.searchInput.value.trim().toLowerCase();
            const fragment = document.createDocumentFragment();

            menuItems.forEach(item => {
                const itemCategory = item.filterCategory || resolveCategoryByName(item);

                // Filter logic
                if (currentFilter !== 'all' && itemCategory !== currentFilter) return;

                if (searchVal) {
                    const indexed = searchIndexById.get(item.id);
                    const haystack = indexed || `${item.ru} ${item.kz} ${item.en}`.toLowerCase();
                    if (!haystack.includes(searchVal)) return;
                }

                const qty = cart[item.id] || 0;

                // Image
                const imgUrl = `https://picsum.photos/seed/${item.img}/200/200`;

                const card = document.createElement('div');
                card.className = 'card';
                card.setAttribute('data-category', itemCategory);
                card.setAttribute('data-name', item.filterName || `${item.ru} ${item.kz} ${item.en}`.toLowerCase());

                let actionBtnHTML = '';
                if (qty === 0) {
                    actionBtnHTML = `
                                <button class="btn-add" onclick="addToCart(${item.id})">+</button>
                            `;
                } else {
                    actionBtnHTML = `
                                <div class="counter-wrapper">
                                    <button class="counter-btn" onclick="updateQty(${item.id}, -1)">–</button>
                                    <span class="counter-val">${qty}</span>
                                    <button class="counter-btn" onclick="updateQty(${item.id}, 1)">+</button>
                                </div>
                            `;
                }

                card.innerHTML = `
                            <div class="card-content">
                                <div>
                                    <div class="card-title">${item[currentLang]}</div>
                                    <div class="card-desc">${item.desc[currentLang]}</div>
                                </div>
                                <div class="card-footer">
                                    <span class="card-price">${formatPrice(item.price)}</span>
                                    ${actionBtnHTML}
                                </div>
                            </div>
                        `;
                fragment.appendChild(card);
            });

            container.replaceChildren(fragment);
        }

        function filterMenu() {
            renderMenu();
        }

        // --- Cart Logic ---

        function addToCart(id) {
            if (!cart[id]) cart[id] = 0;
            cart[id]++;
            renderMenu(); // Update buttons
            updateBottomBar();
        }

        function updateQty(id, delta) {
            if (cart[id]) {
                cart[id] += delta;
                if (cart[id] <= 0) delete cart[id];
                renderMenu();
                updateBottomBar();
            }
        }

        function getCartTotal() {
            let total = 0;
            let count = 0;
            for (const [id, qty] of Object.entries(cart)) {
                const item = menuItemById.get(Number(id));
                if (item) {
                    total += item.price * qty;
                    count += qty;
                }
            }
            return { total, count };
        }

        function updateBottomBar() {
            const { count } = getCartTotal();
            const badge = ui.orderBadge;
            if (!badge) return;
            if (count > 0) {
                badge.style.display = 'inline-block';
                badge.innerText = count;
            } else {
                badge.style.display = 'none';
            }
        }

        // --- Modals ---

        function openCartModal() {
            const { total, count } = getCartTotal();
            if (count === 0) return; // Do nothing if empty

            const list = ui.cartItemsList;
            if (!list) return;
            const fragment = document.createDocumentFragment();
            list.replaceChildren();

            for (const [id, qty] of Object.entries(cart)) {
                const item = menuItemById.get(Number(id));
                if (item) {
                    const row = document.createElement('div');
                    row.className = 'cart-item';
                    row.innerHTML = `
                                <div class="cart-item-info">
                                    <h4>${item[currentLang]}</h4>
                                    <p>${qty} x ${formatPrice(item.price)}</p>
                                </div>
                                <div style="font-weight:600;">${formatPrice(item.price * qty)}</div>
                            `;
                    fragment.appendChild(row);
                }
            }

            if (ui.cartTotalPrice) ui.cartTotalPrice.innerText = formatPrice(total);
            list.appendChild(fragment);
            if (ui.cartModal) ui.cartModal.classList.add('open');
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('open');
        }

        function openConfirmModal() {
            closeModal('cart-modal');
            if (ui.confirmModal) ui.confirmModal.classList.add('open');
        }

        function processOrder() {
            // Try to trigger Call
            // Since we can't guarantee SMS support, user requested Call mainly.
            // We use tel:600
            window.location.href = `tel:600`;

            // Optionally, to handle the "Copy if SMS fails" logic is hard in a simple flow
            // because `tel:` immediately switches apps.
            // But as per requirement, the action is "Call 600".

            // Clear cart after "sending"
            cart = {};
            renderAll();
            closeModal('confirm-modal');
        }

        // Initialize
        document.body.classList.add('menu-booting');
        initCompactMenu();


/* ===== Source script block 2 from menu_app2.html ===== */
(function(){
  if (typeof rawCategories === 'undefined' || typeof menuItems === 'undefined') return;

  // Extend translations (keeps existing RU/KZ/EN support).
  ['ru','kz','en'].forEach(function(lang){ translations[lang] = translations[lang] || {}; });
  Object.assign(translations.ru, {
    tabMenu: 'Кухня',
    tabBar: 'Бар',
    tabOrders: 'Заказы',
    ordersTitleTab: 'Заказы',
    ordersSubtitle: 'Список выбранных блюд и напитков',
    ordersEmpty: 'Вы пока ничего не выбрали',
    showWaiterHint: 'Покажите это официанту',
    goToMenu: 'Вернуться в меню',
    clearOrder: 'Очистить заказ',
    allMenuItemsHint: 'Все блюда',
    allBarItemsHint: 'Все напитки'
  });
  Object.assign(translations.kz, {
    tabMenu: 'Асхана',
    tabBar: 'Бар',
    tabOrders: 'Тапсырыстар',
    ordersTitleTab: 'Тапсырыстар',
    ordersSubtitle: 'Таңдалған тағамдар мен сусындар тізімі',
    ordersEmpty: 'Әзірге ештеңе таңдалмады',
    showWaiterHint: 'Мұны даяшыға көрсетіңіз',
    goToMenu: 'Мәзірге оралу',
    clearOrder: 'Тапсырысты тазалау',
    allMenuItemsHint: 'Барлық тағамдар',
    allBarItemsHint: 'Барлық сусындар'
  });
  Object.assign(translations.en, {
    tabMenu: 'Menu',
    tabBar: 'Bar',
    tabOrders: 'Orders',
    ordersTitleTab: 'Orders',
    ordersSubtitle: 'Selected food and drinks list',
    ordersEmpty: 'No items selected yet',
    showWaiterHint: 'Show this to the waiter',
    goToMenu: 'Back to menu',
    clearOrder: 'Clear order',
    allMenuItemsHint: 'All dishes',
    allBarItemsHint: 'All drinks'
  });

  var FOOD_CATEGORY_IDS = [
    'cold','salads','main','soups','pizza'
  ];

  var BAR_GROUPS = [
    { id: 'bar-soft', ids: ['bar-drinks','bar-water','bar-fresh'], ru:'Вода и напитки', kz:'Су және сусындар', en:'Water & drinks' },
    { id: 'bar-hot-drinks', ids: ['bar-teas','bar-auth-teas','bar-tea-addons','bar-coffee'], ru:'Чай и кофе', kz:'Шай және кофе', en:'Tea & coffee' },
    { id: 'bar-nonalc', ids: ['bar-nonalc-cocktails','bar-lemonades'], ru:'Лимонады и б/а коктейли', kz:'Лимонад және б/а коктейльдер', en:'Lemonades & mocktails' },
    { id: 'bar-alc-mix', ids: ['bar-alc-cocktails','bar-aperitifs'], ru:'Алк. коктейли и аперитивы', kz:'Алк. коктейльдер және аперитивтер', en:'Cocktails & aperitifs' },
    { id: 'bar-beer-all', ids: ['bar-beer-bottled','bar-beer-draft','bar-beer-snacks'], ru:'Пиво и закуски', kz:'Сыра және тіскебасар', en:'Beer & snacks' },
    { id: 'bar-cognac-liquers', ids: ['bar-cognac-fr','bar-cognac-am','bar-cognac-kz','bar-liquers'], ru:'Коньяк и ликёры', kz:'Коньяк және ликерлер', en:'Cognac & liqueurs' },
    { id: 'bar-spirits', ids: ['bar-vodka','bar-gin','bar-tequila','bar-rum'], ru:'Водка / Джин / Текила / Ром', kz:'Арақ / Джин / Текила / Ром', en:'Vodka / Gin / Tequila / Rum' },
    { id: 'bar-whisky', ids: ['bar-scotch','bar-single-malt','bar-jameson','bar-bourbon'], ru:'Виски и бурбон', kz:'Виски және бурбон', en:'Whisky & bourbon' },
    { id: 'bar-wines', ids: ['bar-white-wine-1','bar-white-wine-2','bar-red-wine-1','bar-red-wine-2','bar-wine-spain-red','bar-wine-spain-white','bar-wine-italy-red','bar-wine-italy-white','bar-wine-nz-red','bar-wine-nz-white','bar-wine-france-red','bar-wine-france-white','bar-wine-georgia-red','bar-wine-georgia-white','bar-wine-chile-white','bar-wine-chile-red','bar-wine-austria-red','bar-wine-austria-white','bar-wine-australia-red','bar-wine-australia-white','bar-wine-germany-red','bar-wine-germany-white','bar-sparkling'], ru:'Вина и игристые', kz:'Шараптар және газдалған', en:'Wines & sparkling' },
    { id: 'bar-tobacco', ids: ['bar-cigarettes'], ru:'Табачные изделия', kz:'Темекі өнімдері', en:'Tobacco items' }
  ];

  var barLegacyToGroup = {};
  BAR_GROUPS.forEach(function(group){ group.ids.forEach(function(id){ barLegacyToGroup[id] = group.id; }); });

  // Small icons for category chips (visual hint).
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
    'bar-wines': '🍷',
    'bar-tobacco': '🚬'
  };

  function getFilterIcon(id){
    return FILTER_ICON[id] || (String(id).startsWith('bar-') ? '🍸' : '🍽️');
  }

  var rawCategoryMap = new Map(rawCategories.map(function(c){ return [c.id, c]; }));
  var activeRootTab = 'category'; // category | bar | orders
  var rootTabFilter = { category: 'all', bar: 'all' };

  var topTabsHost = document.createElement('div');
  topTabsHost.className = 'top-tabs-wrap';
  topTabsHost.innerHTML = '<div class="top-tabs" id="top-tabs"></div>';

  // Place top tabs inside sticky header (below logo) and keep categories next to them.
  var headerEl = document.querySelector('header');
  var categoriesEl = document.getElementById('category-filters');
  if (headerEl) {
    if (categoriesEl && categoriesEl.parentNode === headerEl) {
      headerEl.insertBefore(topTabsHost, categoriesEl);
    } else {
      headerEl.appendChild(topTabsHost);
      if (categoriesEl && categoriesEl.parentNode !== headerEl) {
        headerEl.appendChild(categoriesEl);
      }
    }
  } else {
    // Fallback: insert before filters panel.
    var langSwitch = document.querySelector('.lang-switch');
    if (langSwitch && langSwitch.parentNode) {
      langSwitch.parentNode.insertBefore(topTabsHost, document.getElementById('menu-controls-panel'));
      if (categoriesEl && categoriesEl.parentNode !== langSwitch.parentNode) {
        langSwitch.parentNode.insertBefore(categoriesEl, document.getElementById('menu-controls-panel'));
      }
    }
  }

  var ordersView = document.createElement('div');
  ordersView.id = 'orders-view';
  ordersView.className = 'orders-view';
  ordersView.hidden = true;
  var menuContainerEl = document.getElementById('menu-container');
  if (menuContainerEl && menuContainerEl.parentNode) {
    menuContainerEl.parentNode.insertBefore(ordersView, menuContainerEl.nextSibling);
  }

  var orderBtnMain = document.querySelector('.btn-order-main');
  if (orderBtnMain) orderBtnMain.setAttribute('type', 'button');

  function localizeAllLabel(){
    var allCat = rawCategoryMap.get('all');
    return allCat ? allCat[currentLang] : (currentLang === 'ru' ? 'Все' : currentLang === 'kz' ? 'Барлығы' : 'All');
  }

  function getFoodFilterDefs(){
    return [{ id:'all', ru: localizeAllLabel(), kz: localizeAllLabel(), en: localizeAllLabel(), hintByTab: true }].concat(
      FOOD_CATEGORY_IDS.filter(function(id){ return rawCategoryMap.has(id); }).map(function(id){ return rawCategoryMap.get(id); })
    );
  }

  function getBarFilterDefs(){
    return [{ id:'all', ru: localizeAllLabel(), kz: localizeAllLabel(), en: localizeAllLabel(), hintByTab: true }].concat(BAR_GROUPS);
  }

  function getFilterDefsForActiveTab(){
    if (activeRootTab === 'bar') return getBarFilterDefs();
    if (activeRootTab === 'category') return getFoodFilterDefs();
    return [];
  }

  function getItemRootTab(item){
    return String(item.cat || '').startsWith('bar-') ? 'bar' : 'category';
  }

  function getDisplayGroupId(item){
    var root = getItemRootTab(item);
    if (root === 'bar') return barLegacyToGroup[item.cat] || 'bar-other';
    return item.cat;
  }

  function getDisplayGroupName(groupId, rootTab){
    if (groupId === 'all') return localizeAllLabel();
    if (rootTab === 'bar') {
      var g = BAR_GROUPS.find(function(x){ return x.id === groupId; });
      if (g) return g[currentLang] || g.ru || g.en || groupId;
    }
    var c = rawCategoryMap.get(groupId);
    return c ? (c[currentLang] || c.ru || c.en || groupId) : groupId;
  }

  function getIndexedText(item){
    return (searchIndexById.get(item.id) || (item.filterName || ((item.ru||'')+' '+(item.kz||'')+' '+(item.en||'')).toLowerCase()));
  }

  function getSearchValue(){
    return ui.searchInput ? ui.searchInput.value.trim().toLowerCase() : '';
  }

  function getCurrentRootFilter(){
    if (activeRootTab !== 'category' && activeRootTab !== 'bar') return 'all';
    return rootTabFilter[activeRootTab] || 'all';
  }

  function setCurrentRootFilter(val){
    if (activeRootTab === 'category' || activeRootTab === 'bar') {
      rootTabFilter[activeRootTab] = val;
      currentFilter = val;
    }
  }

  function getVisibleItemsForTab(rootTab, options){
    options = options || {};
    if (rootTab === 'orders') return [];
    var searchVal = getSearchValue();
    var filterId = options.filterId;
    if (typeof filterId === 'undefined' || filterId === null) {
      filterId = (rootTab === 'category' || rootTab === 'bar') ? (rootTabFilter[rootTab] || 'all') : 'all';
    }
    if (searchVal && options.ignoreFilterOnSearch !== false) {
      filterId = 'all';
    }
    return menuItems.filter(function(item){
      if (getItemRootTab(item) !== rootTab) return false;
      if (filterId !== 'all' && getDisplayGroupId(item) !== filterId) return false;
      if (searchVal) {
        var hay = getIndexedText(item);
        if (!hay.includes(searchVal)) return false;
      }
      return true;
    });
  }

  function getVisibleItemsForActiveTab(){
    return getVisibleItemsForTab(activeRootTab, {
      filterId: getCurrentRootFilter(),
      ignoreFilterOnSearch: true
    });
  }

  function maybeSwitchTabForSearchResults(){
    if (activeRootTab === 'orders') return;
    var searchVal = getSearchValue();
    if (!searchVal) return;

    var currentMatches = getVisibleItemsForTab(activeRootTab, { filterId: 'all', ignoreFilterOnSearch: true });
    if (currentMatches.length) return;

    var otherTab = activeRootTab === 'bar' ? 'category' : 'bar';
    var otherMatches = getVisibleItemsForTab(otherTab, { filterId: 'all', ignoreFilterOnSearch: true });
    if (otherMatches.length) {
      activeRootTab = otherTab;
    }
  }

  function getSampleItemsText(filterId){
    var t = translations[currentLang] || translations.ru;
    if (filterId === 'all') return activeRootTab === 'bar' ? t.allBarItemsHint : t.allMenuItemsHint;
    var sample = menuItems
      .filter(function(item){
        return getItemRootTab(item) === activeRootTab && getDisplayGroupId(item) === filterId;
      })
      .slice(0, 2)
      .map(function(item){ return item[currentLang] || item.ru || item.en; })
      .filter(Boolean);
    return sample.join(' · ');
  }

  function renderTopTabs(){
    var host = document.getElementById('top-tabs');
    if (!host) return;
    var t = (translations[currentLang] || translations.ru);
    var tabs = [
      { id:'category', label: t.tabMenu || 'Меню' },
      { id:'bar', label: t.tabBar || 'Бар' }
    ];
    host.innerHTML = '';
    tabs.forEach(function(tab){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'top-tab' + (activeRootTab === tab.id ? ' active' : '');
      btn.textContent = tab.label;
      btn.onclick = function(){ switchRootTab(tab.id); };
      host.appendChild(btn);
    });
  }

  function switchRootTab(tabId){
    activeRootTab = tabId;
    document.body.classList.toggle('orders-tab-active', tabId === 'orders');
    if (tabId !== 'orders') {
      currentFilter = getCurrentRootFilter();
      if (typeof setCompactMenuOpen === 'function') setCompactMenuOpen(false, { restoreFocus: false });
    }
    renderAll();
  }

  window.switchRootTab = switchRootTab;

  // ===== Smooth reveal (IntersectionObserver) + fast cart UI updates =====
  var revealObserver = null;

  function ensureRevealObserver(){
    if (revealObserver) return;
    if (!('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { root: null, threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  }

  function markForReveal(el){
    if (!el) return;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.classList.add('is-visible');
        return;
      }
    } catch (e) {}
    el.classList.add('reveal');
    ensureRevealObserver();
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('is-visible');
  }

  function getActionHtml(itemId, qty){
    return qty === 0
      ? '<button class="btn-add" onclick="addToCart('+itemId+')">+</button>'
      : '<div class="counter-wrapper">' +
          '<button class="counter-btn" onclick="updateQty('+itemId+', -1)">–</button>' +
          '<span class="counter-val">'+qty+'</span>' +
          '<button class="counter-btn" onclick="updateQty('+itemId+', 1)">+</button>' +
        '</div>';
  }

  function updateCardControls(itemId){
    var qty = cart[itemId] || 0;
    var html = getActionHtml(itemId, qty);
    var nodes = document.querySelectorAll('[data-action-for="'+itemId+'"]');
    if (!nodes || !nodes.length) return false;
    Array.prototype.forEach.call(nodes, function(node){
      node.innerHTML = html;
    });
    return true;
  }



  function createMenuCard(item){
    var qty = cart[item.id] || 0;
    var card = document.createElement('div');
    card.className = 'card';
    card.dataset.itemId = String(item.id);
    card.dataset.category = getDisplayGroupId(item);
    card.dataset.name = item.filterName || getIndexedText(item);

    var desc = (item.desc && (item.desc[currentLang] || item.desc.ru || item.desc.en)) ? (item.desc[currentLang] || item.desc.ru || item.desc.en) : '';
    var actionHtml = getActionHtml(item.id, qty);

    card.innerHTML = [
      '<div class="card-content">',
        '<div style="min-width:0;flex:1;">',
          '<div class="card-title">'+(item[currentLang] || item.ru || item.en || '')+'</div>',
          '<div class="card-desc">'+(desc || '')+'</div>',
        '</div>',
        '<div class="card-footer">',
          '<span class="card-price">'+formatPrice(item.price)+'</span>',
          '<span class="card-action" data-action-for="'+item.id+'">'+actionHtml+'</span>',
        '</div>',
      '</div>'
    ].join('');

    markForReveal(card);
    return card;
  }

  function renderOrdersPanel(){
    if (!ordersView) return;
    ordersView.hidden = false;
    if (menuContainerEl) menuContainerEl.style.display = 'none';
    var t = translations[currentLang] || translations.ru;
    var entries = Object.entries(cart).map(function(pair){
      return { id: Number(pair[0]), qty: pair[1], item: menuItemById.get(Number(pair[0])) };
    }).filter(function(x){ return x.item; });

    if (!entries.length) {
      ordersView.innerHTML = '\n        <div class="orders-card">\n          <h3 class="orders-title">'+t.ordersTitleTab+'</h3>\n          <p class="orders-subtitle">'+t.ordersSubtitle+'</p>\n          <div class="empty-state">'+t.ordersEmpty+'</div>\n          <div class="orders-actions">\n            <button type="button" class="orders-btn primary" onclick="switchRootTab(\'category\')">'+t.goToMenu+'</button>\n          </div>\n        </div>';
      return;
    }

    var rowsHtml = '';
    entries.forEach(function(entry){
      var root = getItemRootTab(entry.item);
      var groupName = getDisplayGroupName(getDisplayGroupId(entry.item), root);
      rowsHtml += '\n        <div class="order-row">\n          <div>\n            <div class="order-row-title">'+(entry.item[currentLang] || entry.item.ru || entry.item.en)+'</div>\n            <div class="order-row-meta">'+groupName+' · '+entry.qty+' × '+formatPrice(entry.item.price)+'</div>\n          </div>\n          <div class="order-row-price">'+formatPrice(entry.item.price * entry.qty)+'</div>\n        </div>';
    });

    var totals = getCartTotal();
    ordersView.innerHTML = '\n      <div class="orders-card">\n        <h3 class="orders-title">'+t.ordersTitleTab+'</h3>\n        <p class="orders-subtitle">'+t.ordersSubtitle+'</p>\n        '+rowsHtml+'\n        <div class="orders-total"><span>'+ (t.totalLabel || 'Total:') +'</span><span>'+formatPrice(totals.total)+'</span></div>\n        <div class="orders-hint">'+t.showWaiterHint+'</div>\n        <div class="orders-actions">\n          <button type="button" class="orders-btn primary" onclick="switchRootTab(\'category\')">'+t.goToMenu+'</button>\n          <button type="button" class="orders-btn ghost" onclick="clearOrderCart()">'+t.clearOrder+'</button>\n        </div>\n      </div>';
  }

  window.clearOrderCart = function(){
    cart = {};
    renderAll();
  };

  // Preserve legacy updateUIStrings but patch labels after it runs.
  var originalUpdateUIStrings = typeof updateUIStrings === 'function' ? updateUIStrings : null;
  updateUIStrings = function(){
    if (originalUpdateUIStrings) originalUpdateUIStrings();
    var t = translations[currentLang] || translations.ru;
    if (activeRootTab === 'orders') {
      if (ui.searchInput) ui.searchInput.placeholder = t.searchPh || '';
    }
    var toggleBtn = document.getElementById('menu-toggle-btn');
    if (toggleBtn) {
      var toggleLabelSpan = toggleBtn.querySelector('span:last-child');
      if (toggleLabelSpan) toggleLabelSpan.textContent = (currentLang === 'ru' ? 'Фильтры' : currentLang === 'kz' ? 'Сүзгілер' : 'Filters');
    }
  };

  renderFilters = function(){
    renderTopTabs();

    var controlsPanel = document.getElementById('menu-controls-panel');
    if (!ui.filtersContainer) return;

    if (activeRootTab === 'orders') {
      if (controlsPanel) controlsPanel.style.display = 'none';
      ui.filtersContainer.innerHTML = '';
      return;
    }

    if (controlsPanel) controlsPanel.style.display = '';
    var defs = getFilterDefsForActiveTab();
    var selected = getCurrentRootFilter();
    currentFilter = selected;

    ui.filtersContainer.innerHTML = '';
    defs.forEach(function(def){
      var label = def[currentLang] || def.ru || def.en || def.id;
      var sample = getSampleItemsText(def.id);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip ' + (selected === def.id ? 'active' : '');
      btn.setAttribute('data-category', def.id);
      btn.setAttribute('aria-pressed', String(selected === def.id));
      btn.innerHTML = '<span class="chip-title">'+'<span class="chip-ico" aria-hidden="true">'+getFilterIcon(def.id)+'</span>'+'<span class="chip-title-text">'+label+'</span>'+'</span>' + (sample ? '<span class="chip-sub">'+sample+'</span>' : '');
      btn.onclick = function(){
        setCurrentRootFilter(def.id);
        renderAll();
      };
      ui.filtersContainer.appendChild(btn);
    });
  };

  function renderEmptyMenuState(){
    if (!menuContainerEl) return;
    menuContainerEl.classList.remove('menu-grouped');
    menuContainerEl.innerHTML = '<div class="empty-state" style="width:100%;">'+((translations[currentLang]||translations.ru).ordersEmpty.replace('ничего не выбрали','ничего не найдено').replace('ештеңе таңдалмады','ештеңе табылмады').replace('No items selected yet','No items found'))+'</div>';

    menuContainerEl.style.display = '';
  }

  renderMenu = function(){
    if (!menuContainerEl) return;
    if (activeRootTab === 'orders') {
      renderOrdersPanel();
      return;
    }

    ordersView.hidden = true;
    if (menuContainerEl) menuContainerEl.style.display = '';

    var items = getVisibleItemsForActiveTab();
    if (!items.length) {
      renderEmptyMenuState();
      return;
    }

    var filterId = getCurrentRootFilter();
    menuContainerEl.innerHTML = '';

    if (filterId === 'all') {
      menuContainerEl.classList.add('menu-grouped');
      var defs = getFilterDefsForActiveTab().filter(function(def){ return def.id !== 'all'; });
      defs.forEach(function(def){
        var subset = items.filter(function(item){ return getDisplayGroupId(item) === def.id; });
        if (!subset.length) return;

        var section = document.createElement('section');
        section.className = 'menu-section';

        var title = document.createElement('h3');
        title.className = 'menu-section-title';
        title.textContent = def[currentLang] || def.ru || def.en || def.id;
        section.appendChild(title);

        var grid = document.createElement('div');
        grid.className = 'menu-section-items';
        subset.forEach(function(item){ grid.appendChild(createMenuCard(item)); });
        section.appendChild(grid);
        menuContainerEl.appendChild(section);
      });
    } else {
      menuContainerEl.classList.remove('menu-grouped');
      var frag = document.createDocumentFragment();
      items.forEach(function(item){ frag.appendChild(createMenuCard(item)); });
      menuContainerEl.replaceChildren(frag);
    }
  };

  filterMenu = function(){
    if (activeRootTab === 'orders') { renderOrdersPanel(); return; }
    renderMenu();
  };

  addToCart = function(id){
    if (!cart[id]) cart[id] = 0;
    cart[id]++;

    if (activeRootTab === 'orders') {
      renderOrdersPanel();
    } else {
      // Fast path: only update the changed card controls (no full re-render)
      if (!updateCardControls(id)) renderMenu();
    }

    updateBottomBar();
    renderTopTabs();
  };

  updateQty = function(id, delta){
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];

    if (activeRootTab === 'orders') {
      renderOrdersPanel();
    } else {
      if (!updateCardControls(id)) renderMenu();
    }

    updateBottomBar();
    renderTopTabs();
  };

  updateBottomBar = function(){
    var totals = getCartTotal();
    var badge = ui.orderBadge;
    var btnText = document.getElementById('btn-order-text');
    var t = translations[currentLang] || translations.ru;

    if (btnText) btnText.textContent = t.tabOrders || t.orderBtn || 'Заказы';
    if (badge) {
      if (totals.count > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = String(totals.count);
      } else {
        badge.style.display = 'none';
      }
    }
  };

  openCartModal = function(){
    switchRootTab('orders');
  };

  setLang = function(lang){
    currentLang = lang;
    langButtons.forEach(function(btn){
      var btnLang = (btn.dataset.lang || btn.innerText || '').trim().toLowerCase();
      btn.classList.toggle('active', btnLang === lang);
    });
    renderAll();
  };

  renderAll = function(){
    renderFilters();
    renderMenu();
    updateUIStrings();
    updateBottomBar();
    renderTopTabs();
  };

  var renderQueued = false;
  var progressiveRenderToken = 0;
  var searchDebounceTimer = null;
  var firstInteractivePaintDone = false;
  var bootRenderQueued = false;
  var INITIAL_SYNC_SECTIONS = 3;
  var SECTION_BATCH_SIZE = 3;

  function nextFrame(callback){
    if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
    return setTimeout(callback, 16);
  }

  function cancelNextFrame(id){
    if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  }

  function finishInteractivePaint(){
    if (firstInteractivePaintDone) return;
    firstInteractivePaintDone = true;
    document.body.classList.remove('menu-booting');
    document.body.classList.add('menu-ready');
  }

  function queueRenderAll(){
    if (renderQueued) return;
    renderQueued = true;
    nextFrame(function(){
      renderQueued = false;
      renderAllNow();
    });
  }

  function createGroupedSection(def, subset){
    var section = document.createElement('section');
    section.className = 'menu-section';
    markForReveal(section);

    var title = document.createElement('h3');
    title.className = 'menu-section-title';
    title.textContent = def[currentLang] || def.ru || def.en || def.id;
    section.appendChild(title);

    var grid = document.createElement('div');
    grid.className = 'menu-section-items';
    subset.forEach(function(item){ grid.appendChild(createMenuCard(item)); });
    section.appendChild(grid);
    return section;
  }

  function renderMenuProgressively(items, defs){
    progressiveRenderToken += 1;
    var token = progressiveRenderToken;
    menuContainerEl.innerHTML = '';
    menuContainerEl.classList.add('menu-grouped');
    menuContainerEl.style.display = '';

    var grouped = Object.create(null);
    items.forEach(function(item){
      var groupId = getDisplayGroupId(item);
      if (!grouped[groupId]) grouped[groupId] = [];
      grouped[groupId].push(item);
    });

    var groups = defs.filter(function(def){ return def.id !== 'all' && grouped[def.id] && grouped[def.id].length; });
    var index = 0;

    function appendBatch(batchSize){
      if (token !== progressiveRenderToken) return;
      var fragment = document.createDocumentFragment();
      for (var count = 0; count < batchSize && index < groups.length; count += 1, index += 1) {
        var def = groups[index];
        fragment.appendChild(createGroupedSection(def, grouped[def.id]));
      }
      if (fragment.childNodes.length) {
        menuContainerEl.appendChild(fragment);
        finishInteractivePaint();
      }
      if (index < groups.length) {
        nextFrame(function(){ appendBatch(SECTION_BATCH_SIZE); });
      }
    }

    appendBatch(INITIAL_SYNC_SECTIONS);
  }

  function renderEmptyMenuStateFast(){
    renderEmptyMenuState();
    finishInteractivePaint();
  }

  renderMenu = function(){
    if (!menuContainerEl) return;
    progressiveRenderToken += 1;

    if (activeRootTab === 'orders') {
      renderOrdersPanel();
      finishInteractivePaint();
      return;
    }

    ordersView.hidden = true;
    menuContainerEl.style.display = '';

    var items = getVisibleItemsForActiveTab();
    if (!items.length) {
      renderEmptyMenuStateFast();
      return;
    }

    var filterId = getSearchValue() ? 'all' : getCurrentRootFilter();

    if (filterId === 'all') {
      renderMenuProgressively(items, getFilterDefsForActiveTab());
      return;
    }

    menuContainerEl.classList.remove('menu-grouped');
    var frag = document.createDocumentFragment();
    items.forEach(function(item){ frag.appendChild(createMenuCard(item)); });
    menuContainerEl.replaceChildren(frag);
    finishInteractivePaint();
  };

  filterMenu = function(){
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(function(){
      if (activeRootTab === 'orders') {
        queueRenderAll();
        return;
      }
      queueRenderAll();
    }, 80);
  };

  var searchInputEl = ui.searchInput;
  if (searchInputEl && !searchInputEl.dataset.fastInputBound) {
    searchInputEl.dataset.fastInputBound = '1';
    searchInputEl.removeAttribute('oninput');
    searchInputEl.addEventListener('input', filterMenu, { passive: true });
  }

  function openOverlay(modal){
    if (!modal) return;
    modal.hidden = false;
    nextFrame(function(){
      modal.classList.add('open');
    });
  }

  function hideOverlay(modal){
    if (!modal) return;
    modal.classList.remove('open');
  }

  Array.prototype.forEach.call(document.querySelectorAll('.modal-overlay'), function(modal){
    modal.hidden = !modal.classList.contains('open');
    modal.addEventListener('click', function(event){
      if (event.target === modal) hideOverlay(modal);
    });
    modal.addEventListener('transitionend', function(event){
      if (event.target !== modal) return;
      if (!modal.classList.contains('open')) {
        modal.hidden = true;
      }
    });
  });

  openCartModal = function(){
    var totals = getCartTotal();
    if (totals.count === 0) return;

    var list = ui.cartItemsList;
    if (!list) return;
    var fragment = document.createDocumentFragment();
    list.replaceChildren();

    Object.entries(cart).forEach(function(entry){
      var item = menuItemById.get(Number(entry[0]));
      var qty = entry[1];
      if (!item) return;
      var row = document.createElement('div');
      row.className = 'cart-item';      row.innerHTML = `<div class="cart-item-info"><h4>${item[currentLang] || item.ru || item.en || ''}</h4><p>${qty} x ${formatPrice(item.price)}</p></div><div style="font-weight:600;">${formatPrice(item.price * qty)}</div>`;
      fragment.appendChild(row);
    });

    if (ui.cartTotalPrice) ui.cartTotalPrice.innerText = formatPrice(totals.total);
    list.appendChild(fragment);
    openOverlay(ui.cartModal);
  };

  closeModal = function(modalId){
    hideOverlay(document.getElementById(modalId));
  };

  openConfirmModal = function(){
    closeModal('cart-modal');
    openOverlay(ui.confirmModal);
  };

  var resizeRafId = null;
  window.addEventListener('resize', function(){
    if (resizeRafId) cancelNextFrame(resizeRafId);
    resizeRafId = nextFrame(function(){
      resizeRafId = null;
      if (!isCompactMenuViewport()) {
        setCompactMenuOpen(false, { restoreFocus: false });
      }
    });
  }, { passive: true });

  var originalSwitchRootTab = switchRootTab;
  switchRootTab = function(tabId){
    originalSwitchRootTab(tabId);
    queueRenderAll();
  };
  window.switchRootTab = switchRootTab;

  var originalSetLangFast = setLang;
  setLang = function(lang){
    originalSetLangFast(lang);
    queueRenderAll();
  };

  renderAllNow = function(){
    maybeSwitchTabForSearchResults();
    renderFilters();
    renderMenu();
    updateUIStrings();
    updateBottomBar();
    renderTopTabs();
  };

  renderAll = function(){
    queueRenderAll();
  };

  function scheduleInitialRender(){
    if (bootRenderQueued) return;
    bootRenderQueued = true;
    nextFrame(function(){
      bootRenderQueued = false;
      renderAllNow();
    });
  }

  // Initial refresh with new UI.
  scheduleInitialRender();
})();


/* ===== Source script block 3 from menu_app2.html ===== */
(function(){
  function applyHeaderAndCategoriesLayout(){
    var headerEl = document.querySelector('header');
    var headerRow = document.querySelector('header .logo-area');
    var topTabsWrap = document.querySelector('header .top-tabs-wrap');
    var toggleBtn = document.getElementById('menu-toggle-btn');
    var langSwitch = document.querySelector('.lang-switch');
    var controlsPanel = document.getElementById('menu-controls-panel');
    var categories = document.getElementById('category-filters');
    var searchInput = document.getElementById('search-input');
    var backdrop = document.getElementById('menu-backdrop');

    if (headerRow && langSwitch && !langSwitch.classList.contains('header-lang')) {
      langSwitch.classList.add('header-lang');
      if (toggleBtn && toggleBtn.parentNode === headerRow) {
        headerRow.replaceChild(langSwitch, toggleBtn);
      } else {
        headerRow.appendChild(langSwitch);
        if (toggleBtn) toggleBtn.remove();
      }
    } else if (toggleBtn) {
      toggleBtn.remove();
    }

    if (headerEl && categories) {
      if (topTabsWrap) {
        if (categories.parentNode !== headerEl || categories.previousElementSibling !== topTabsWrap) {
          topTabsWrap.insertAdjacentElement('afterend', categories);
        }
      } else if (categories.parentNode !== headerEl) {
        headerEl.appendChild(categories);
      }
    }

    document.body.classList.remove('mobile-menu-ready', 'mobile-menu-open');
    if (controlsPanel) {
      controlsPanel.style.display = 'flex';
      controlsPanel.setAttribute('aria-hidden', 'false');
      if ('inert' in controlsPanel) controlsPanel.inert = false;
    }

    if (backdrop) {
      backdrop.hidden = true;
      backdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (typeof window.setCompactMenuOpen === 'function') {
    window.setCompactMenuOpen = function(){};
  }
  if (typeof window.initCompactMenu === 'function') {
    window.initCompactMenu = function(){ applyHeaderAndCategoriesLayout(); };
  }

  applyHeaderAndCategoriesLayout();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHeaderAndCategoriesLayout, { once: true });
  }
  window.addEventListener('load', applyHeaderAndCategoriesLayout, { once: true });
})();
