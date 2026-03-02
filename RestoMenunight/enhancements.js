/* ================================================================
   enhancements.js — Sultan Plaza Extra Features
   ================================================================
   Features:
   1. Toast notifications when adding/removing items
   2. Favorites (localStorage)
   3. Item detail modal (tap anywhere on card)
   4. Sort by price (asc/desc/default)
   5. Favorites filter
   6. Table number modal
   7. Rebuild cart items with inline qty controls
   8. Beautiful card creation (replace from app.js)
   ================================================================ */

(function () {
  'use strict';

  // ── Wait until app.js has done its initial render ──────────────
  function waitForApp(cb) {
    if (typeof menuItems !== 'undefined' && menuItems.length) {
      cb();
    } else {
      setTimeout(() => waitForApp(cb), 80);
    }
  }

  waitForApp(init);

  // ── State ──────────────────────────────────────────────────────
  let sortMode     = 'default'; // 'default' | 'asc' | 'desc'
  let favFilter    = false;
  let favorites    = loadFavorites();
  let detailItemId = null;
  let detailQty    = 1;
  let tableNumber  = '';

  // ── Popular item IDs (first few items get a badge) ─────────────
  const POPULAR_BADGE = { ru: '🔥 Хит', kz: '🔥 Хит', en: '🔥 Hot' };
  const popularItemNames = new Set([
    'Мясное плато', 'Цезарь с курицей', 'Цыпленок с пюре и зеленым луком',
    'Пепперони', 'Mojito (Long)', 'Маргарита (Long)', 'Лимонады'
  ]);

  function isPopular(item) {
    return popularItemNames.has(item.ru) || popularItemNames.has(item.en);
  }

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    setupSearchClear();
    hookCardCreation();
    hookCartModal();
    hookConfirmModal();
    setupDetailModal();
    patchUpdateQty();
    patchAddToCart();
    renderToolbar();
  }

  // ── Search clear button ────────────────────────────────────────
  function setupSearchClear() {
    const inp = document.getElementById('search-input');
    if (!inp) return;
    inp.addEventListener('input', () => {
      const btn = document.getElementById('search-clear-btn');
      if (btn) btn.style.display = inp.value ? 'flex' : 'none';
    });
  }

  window.clearSearch = function () {
    const inp = document.getElementById('search-input');
    if (inp) {
      inp.value = '';
      inp.dispatchEvent(new Event('input'));
      if (typeof filterMenu === 'function') filterMenu();
    }
    const btn = document.getElementById('search-clear-btn');
    if (btn) btn.style.display = 'none';
  };

  // ── Toolbar render & i18n ──────────────────────────────────────
  function renderToolbar() {
    updateToolbarLabels();
  }

  function updateToolbarLabels() {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
    const labels = {
      ru: { sort: sortMode === 'asc' ? '↑ Дешевле' : sortMode === 'desc' ? '↓ Дороже' : '↕ По цене', fav: '♡ Избранное' },
      kz: { sort: sortMode === 'asc' ? '↑ Арзан' : sortMode === 'desc' ? '↓ Қымбат' : '↕ Бағасы', fav: '♡ Таңдаулы' },
      en: { sort: sortMode === 'asc' ? '↑ Cheapest' : sortMode === 'desc' ? '↓ Priciest' : '↕ By price', fav: '♡ Favourites' },
    };
    const t = labels[lang] || labels.ru;
    const sortLabel = document.getElementById('sort-label');
    const favLabel  = document.getElementById('fav-filter-label');
    if (sortLabel) sortLabel.textContent = t.sort;
    if (favLabel)  favLabel.textContent  = t.fav;

    const sortBtn = document.getElementById('sort-btn');
    if (sortBtn) sortBtn.classList.toggle('active', sortMode !== 'default');

    const favBtn = document.getElementById('fav-filter-btn');
    if (favBtn) favBtn.classList.toggle('active', favFilter);
  }

  // ── Sort ───────────────────────────────────────────────────────
  window.toggleSort = function () {
    if (sortMode === 'default') sortMode = 'asc';
    else if (sortMode === 'asc') sortMode = 'desc';
    else sortMode = 'default';
    updateToolbarLabels();
    if (typeof renderMenu === 'function') renderMenu();
  };

  // ── Favourites filter ──────────────────────────────────────────
  window.toggleFavFilter = function () {
    favFilter = !favFilter;
    updateToolbarLabels();
    if (typeof renderMenu === 'function') renderMenu();
  };

  // ── Favorites storage ──────────────────────────────────────────
  function loadFavorites() {
    try { return new Set(JSON.parse(localStorage.getItem('sp_favs') || '[]')); }
    catch (_) { return new Set(); }
  }

  function saveFavorites() {
    try { localStorage.setItem('sp_favs', JSON.stringify([...favorites])); } catch (_) {}
  }

  window.toggleFavorite = function (id, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
      showToast('♡', getFavToastText());
    }
    saveFavorites();
    // Update all fav buttons for this item
    document.querySelectorAll(`.card-fav-btn[data-fav-id="${id}"]`).forEach(btn => {
      btn.classList.toggle('active', favorites.has(id));
      btn.textContent = favorites.has(id) ? '♥' : '♡';
    });
    // Update card border
    document.querySelectorAll(`.card[data-item-id="${id}"]`).forEach(card => {
      card.classList.toggle('is-fav', favorites.has(id));
    });
  };

  function getFavToastText() {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
    return { ru: 'Добавлено в избранное', kz: 'Таңдаулыларға қосылды', en: 'Added to favourites' }[lang];
  }

  // ── Toast ──────────────────────────────────────────────────────
  window.showToast = function (icon, text, duration) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-name">${text}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('out');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration || 2400);
  };

  // ── Hook card creation ─────────────────────────────────────────
  function hookCardCreation() {
    // We'll override createMenuCard after the first renderMenu completes
    // via a short timeout so app.js's createMenuCard is accessible
    setTimeout(() => {
      if (typeof createMenuCard === 'function') {
        const _orig = createMenuCard;
        window.createMenuCard = function (item) {
          const card = buildCard(item);
          return card;
        };
      }
    }, 200);

    // Also patch renderMenu to apply sort/favFilter
    if (typeof renderMenu === 'function') {
      const _origRender = renderMenu;
      window.renderMenu = function () {
        applySortAndFilter();
        _origRender();
        updateToolbarLabels();
      };
    }
  }

  function applySortAndFilter() {
    if (typeof menuItems === 'undefined') return;

    // Fav filter
    const allItems = window._origMenuItems || menuItems.slice();
    if (!window._origMenuItems) window._origMenuItems = menuItems.slice();

    if (favFilter) {
      menuItems.length = 0;
      allItems.forEach(item => { if (favorites.has(item.id)) menuItems.push(item); });
    } else {
      menuItems.length = 0;
      allItems.forEach(item => menuItems.push(item));
    }

    // Sort
    if (sortMode === 'asc') {
      menuItems.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'desc') {
      menuItems.sort((a, b) => b.price - a.price);
    } else {
      // Restore default order
      menuItems.sort((a, b) => a.id - b.id);
    }
  }

  // ── Build luxury card ──────────────────────────────────────────
  function buildCard(item) {
    const qty   = (typeof cart !== 'undefined') ? (cart[item.id] || 0) : 0;
    const lang  = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
    const name  = item[lang] || item.ru || item.en || '';
    const desc  = (item.desc && (item.desc[lang] || item.desc.ru)) || '';
    const price = (typeof formatPrice === 'function') ? formatPrice(item.price) : `${item.price} ₸`;
    const isFav = favorites.has(item.id);
    const pop   = isPopular(item);

    const card = document.createElement('div');
    card.className = 'card' + (isFav ? ' is-fav' : '');
    card.dataset.itemId  = String(item.id);
    card.dataset.category = (typeof getDisplayGroupId === 'function') ? getDisplayGroupId(item) : item.cat;
    card.dataset.name    = item.filterName || name.toLowerCase();

    // Badge
    const badgeHtml = pop
      ? `<span class="card-badge">${POPULAR_BADGE[lang] || POPULAR_BADGE.ru}</span>`
      : '';

    // Fav button
    const favHtml = `<button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-id="${item.id}" onclick="toggleFavorite(${item.id}, event)" aria-label="В избранное">${isFav ? '♥' : '♡'}</button>`;

    // Action
    const actionHtml = buildActionHtml(item.id, qty);

    card.innerHTML = `
      ${badgeHtml}
      ${favHtml}
      <div class="card-content" onclick="openItemDetail(${item.id})">
        <div>
          <div class="card-title">${name}</div>
          ${desc ? `<div class="card-desc">${desc}</div>` : ''}
        </div>
        <div class="card-footer">
          <span class="card-price">${price}</span>
          <span class="card-action" data-action-for="${item.id}">${actionHtml}</span>
        </div>
      </div>`;

    // Stop propagation on action span so clicking +/- doesn't open detail
    const actionSpan = card.querySelector('.card-action');
    if (actionSpan) {
      actionSpan.addEventListener('click', e => e.stopPropagation());
    }

    // Reveal
    if (typeof markForReveal === 'function') markForReveal(card);

    return card;
  }

  function buildActionHtml(itemId, qty) {
    if (qty === 0) {
      return `<button class="btn-add" onclick="addToCart(${itemId})" aria-label="Добавить">+</button>`;
    }
    return `<div class="counter-wrapper">
      <button class="counter-btn" onclick="updateQty(${itemId}, -1)">–</button>
      <span class="counter-val">${qty}</span>
      <button class="counter-btn" onclick="updateQty(${itemId}, 1)">+</button>
    </div>`;
  }

  // ── Patch addToCart with toast ─────────────────────────────────
  function patchAddToCart() {
    setTimeout(() => {
      if (typeof addToCart !== 'function') return;
      const _orig = addToCart;
      window.addToCart = function (id) {
        _orig(id);
        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
        const item = (typeof menuItemById !== 'undefined') ? menuItemById.get(Number(id)) : null;
        const name = item ? (item[lang] || item.ru || '') : '';
        const text = { ru: `Добавлено: ${name}`, kz: `Қосылды: ${name}`, en: `Added: ${name}` }[lang];
        showToast('✓', text || 'Добавлено');
        animateBadge();
      };
    }, 300);
  }

  function patchUpdateQty() {
    setTimeout(() => {
      if (typeof updateQty !== 'function') return;
      const _orig = updateQty;
      window.updateQty = function (id, delta) {
        _orig(id, delta);
        // Sync detail modal qty if open
        if (detailItemId === id) {
          const qty = (typeof cart !== 'undefined') ? (cart[id] || 0) : 0;
          const val = document.getElementById('detail-qty-val');
          if (val) val.textContent = Math.max(1, qty);
        }
      };
    }, 300);
  }

  function animateBadge() {
    const badge = document.getElementById('btn-order-badge');
    if (!badge) return;
    badge.style.transform = 'scale(1.4)';
    badge.style.transition = 'transform .15s ease';
    setTimeout(() => { badge.style.transform = 'scale(1)'; }, 160);
  }

  // ── Item Detail Modal ──────────────────────────────────────────
  function setupDetailModal() {
    const overlay = document.getElementById('item-detail-modal');
    if (!overlay) return;
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal('item-detail-modal');
    });
  }

  window.openItemDetail = function (id) {
    const item = (typeof menuItemById !== 'undefined') ? menuItemById.get(Number(id)) : null;
    if (!item) return;

    detailItemId = id;
    const lang   = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
    const name   = item[lang] || item.ru || item.en || '';
    const desc   = (item.desc && (item.desc[lang] || item.desc.ru || item.desc.en)) || '';
    const price  = (typeof formatPrice === 'function') ? formatPrice(item.price) : `${item.price} ₸`;

    // Current qty (if already in cart use that, else 1)
    detailQty = (typeof cart !== 'undefined' && cart[id]) ? cart[id] : 1;

    const titleEl = document.getElementById('detail-title');
    const descEl  = document.getElementById('detail-desc');
    const priceEl = document.getElementById('detail-price');
    const qtyEl   = document.getElementById('detail-qty-val');
    const heroEl  = document.getElementById('detail-hero');
    const addBtn  = document.getElementById('detail-add-btn');
    const addText = document.getElementById('detail-add-text');

    if (titleEl) titleEl.textContent = name;
    if (descEl)  descEl.textContent  = desc;
    if (priceEl) priceEl.textContent = price;
    if (qtyEl)   qtyEl.textContent   = detailQty;

    // Hero emoji/image
    const categoryEmojis = {
      cold:'🥗', salads:'🥗', main:'🍽️', soups:'🍲', pizza:'🍕',
      'bar-drinks':'🥤', 'bar-teas':'🍵', 'bar-auth-teas':'🫖',
      'bar-alc-cocktails':'🍸', 'bar-nonalc-cocktails':'🧃',
      'bar-lemonades':'🍹', 'bar-coffee':'☕', 'bar-cognac-fr':'🥃',
      'bar-beer-bottled':'🍺', 'bar-wines':'🍷', 'bar-fresh':'🍊',
      default:'🍽️'
    };
    const emoji = categoryEmojis[item.cat] || categoryEmojis.default;
    if (heroEl) {
      heroEl.innerHTML = `<div style="font-size:90px;z-index:1;position:relative;">${emoji}</div><div class="item-detail-hero-overlay"></div>`;
    }

    // Button text
    const inCart = typeof cart !== 'undefined' && cart[id] > 0;
    if (addText) {
      addText.textContent = inCart
        ? { ru:'Обновить в заказе', kz:'Тапсырысты жаңарту', en:'Update order' }[lang]
        : { ru:'Добавить в заказ', kz:'Тапсырысқа қосу', en:'Add to order' }[lang];
    }

    openModalOverlay('item-detail-modal');
  };

  window.detailQtyChange = function (delta) {
    detailQty = Math.max(1, detailQty + delta);
    const val = document.getElementById('detail-qty-val');
    if (val) val.textContent = detailQty;
  };

  window.detailAddToCart = function () {
    if (!detailItemId) return;
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ru';

    if (typeof cart !== 'undefined') {
      const current = cart[detailItemId] || 0;
      const diff    = detailQty - current;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          if (typeof addToCart === 'function') addToCart(detailItemId);
        }
      } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
          if (typeof updateQty === 'function') updateQty(detailItemId, -1);
        }
      }
    }

    const item = (typeof menuItemById !== 'undefined') ? menuItemById.get(Number(detailItemId)) : null;
    const name = item ? (item[lang] || item.ru) : '';
    showToast('✓', { ru:`Добавлено: ${name}`, kz:`Қосылды: ${name}`, en:`Added: ${name}` }[lang] || 'OK');
    closeModal('item-detail-modal');
  };

  // ── Cart Modal with inline controls ───────────────────────────
  function hookCartModal() {
    // Patch openCartModal to use our rich cart UI
    setTimeout(() => {
      const origOpen = window.openCartModal;
      window.openCartModal = function () {
        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
        const totals = (typeof getCartTotal === 'function') ? getCartTotal() : { total: 0, count: 0 };
        if (totals.count === 0) {
          showToast('🛒', { ru:'Корзина пуста', kz:'Себет бос', en:'Cart is empty' }[lang]);
          return;
        }
        renderRichCart();
        openModalOverlay('cart-modal');
      };
    }, 400);
  }

  function renderRichCart() {
    const list   = document.getElementById('cart-items-list');
    const totals = (typeof getCartTotal === 'function') ? getCartTotal() : { total: 0, count: 0 };
    const lang   = (typeof currentLang !== 'undefined') ? currentLang : 'ru';

    if (!list) return;
    list.innerHTML = '';

    const entries = Object.entries(typeof cart !== 'undefined' ? cart : {});
    entries.forEach(([id, qty]) => {
      const item = (typeof menuItemById !== 'undefined') ? menuItemById.get(Number(id)) : null;
      if (!item) return;
      const name  = item[lang] || item.ru || item.en;
      const price = (typeof formatPrice === 'function') ? formatPrice(item.price) : `${item.price} ₸`;
      const total = (typeof formatPrice === 'function') ? formatPrice(item.price * qty) : `${item.price * qty} ₸`;

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-info">
          <h4>${name}</h4>
          <p>${qty} × ${price}</p>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="cartChangeQty(${id}, -1)">–</button>
          <span class="cart-qty-val" id="cqv-${id}">${qty}</span>
          <button class="cart-qty-btn" onclick="cartChangeQty(${id}, 1)">+</button>
        </div>
        <div class="cart-item-price" id="cip-${id}">${total}</div>`;
      list.appendChild(row);
    });

    const priceEl = document.getElementById('cart-total-price');
    if (priceEl) priceEl.textContent = (typeof formatPrice === 'function') ? formatPrice(totals.total) : `${totals.total} ₸`;
  }

  window.cartChangeQty = function (id, delta) {
    if (typeof updateQty === 'function') updateQty(id, delta);
    // Re-render cart
    renderRichCart();
    const totals = (typeof getCartTotal === 'function') ? getCartTotal() : { total: 0, count: 0 };
    if (totals.count === 0) closeModal('cart-modal');
  };

  // ── Confirm Modal with table number ───────────────────────────
  function hookConfirmModal() {
    setTimeout(() => {
      window.openConfirmModal = function () {
        closeModal('cart-modal');
        // Show table number modal first
        openModalOverlay('table-modal');
      };
    }, 400);
  }

  window.confirmTableNumber = function () {
    const inp = document.getElementById('table-number-input');
    tableNumber = inp ? inp.value.trim() : '';
    closeModal('table-modal');
    openModalOverlay('confirm-modal');
    // Update confirm message with table number
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
    const msgEl = document.getElementById('confirm-message');
    if (msgEl && tableNumber) {
      const msgs = {
        ru: `Столик №${tableNumber}. Позвонить на 600 и оформить заказ?`,
        kz: `Үстел №${tableNumber}. 600 нөміріне хабарласасыз ба?`,
        en:  `Table #${tableNumber}. Call 600 to place order?`
      };
      msgEl.textContent = msgs[lang] || msgs.ru;
    }
  };

  // ── openModalOverlay helper ────────────────────────────────────
  window.openModalOverlay = function (id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { modal.classList.add('open'); });
    });
  };

  // Patch closeModal globally
  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open');
    modal.addEventListener('transitionend', function handler() {
      modal.hidden = true;
      modal.removeEventListener('transitionend', handler);
    });
  };

  // ── Multilingual toolbar on lang change ───────────────────────
  const _origSetLang = window.setLang;
  window.setLang = function (lang) {
    if (_origSetLang) _origSetLang(lang);
    updateToolbarLabels();
  };

  // ── i18n for new modals ───────────────────────────────────────
  function patchUpdateUIStrings() {
    const _orig = window.updateUIStrings;
    window.updateUIStrings = function () {
      if (_orig) _orig();
      updateToolbarLabels();
      const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
      const strings = {
        ru: {
          cartTitle:    'Ваш заказ',
          checkout:     'Оформить заказ',
          cancel:       'Назад',
          tableTitle:   'Номер столика',
          tableDesc:    'Укажите ваш столик для передачи официанту',
          tableConfirm: 'Подтвердить',
          tableSkip:    'Пропустить',
          detailAdd:    'Добавить в заказ',
        },
        kz: {
          cartTitle:    'Тапсырысыңыз',
          checkout:     'Тапсырысты рәсімдеу',
          cancel:       'Артқа',
          tableTitle:   'Үстел нөмірі',
          tableDesc:    'Даяшыға беру үшін үстеліңізді көрсетіңіз',
          tableConfirm: 'Растау',
          tableSkip:    'Өткізіп жіберу',
          detailAdd:    'Тапсырысқа қосу',
        },
        en: {
          cartTitle:    'Your order',
          checkout:     'Checkout',
          cancel:       'Back',
          tableTitle:   'Table number',
          tableDesc:    'Enter your table for the waiter',
          tableConfirm: 'Confirm',
          tableSkip:    'Skip',
          detailAdd:    'Add to order',
        },
      };
      const t = strings[lang] || strings.ru;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set('cart-title',          t.cartTitle);
      set('btn-checkout-text',   t.checkout);
      set('btn-cancel-text',     t.cancel);
      set('table-title',         t.tableTitle);
      set('table-desc',          t.tableDesc);
      set('table-confirm-text',  t.tableConfirm);
      set('table-skip-text',     t.tableSkip);
      set('detail-add-text',     t.detailAdd);
    };
  }

  setTimeout(patchUpdateUIStrings, 100);

})();
