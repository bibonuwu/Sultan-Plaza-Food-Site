/* ===== admin.js — Sultan Plaza Admin Panel ===== */

const STORAGE_KEY = 'sp_receipts';
const fmt = new Intl.NumberFormat('ru-RU');
const fmtPrice = value => fmt.format(Number(value) || 0) + ' ₸';

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function loadReceipts() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data.filter(item => item && typeof item === 'object') : [];
  } catch (error) {
    console.warn('Не удалось прочитать сохранённые чеки', error);
    return [];
  }
}

function saveAll(receipts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

function parseDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function isSameDay(first, second) {
  return first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day));
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function fmtTime(iso) {
  const date = parseDate(iso);
  if (date.getTime() === 0) return '—';
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateShort(iso) {
  const date = parseDate(iso);
  if (date.getTime() === 0) return 'Без даты';
  const today = new Date();
  if (isSameDay(date, today)) return 'Сегодня';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Вчера';
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function genReceiptNum(id) {
  const digits = String(id || '').replace(/\D/g, '');
  return '#' + (digits ? digits.slice(-5).padStart(4, '0') : '0000');
}

function receiptTotal(receipt) {
  return Number(receipt.total) || 0;
}

function receiptItemCount(receipt) {
  return (Array.isArray(receipt.items) ? receipt.items : [])
    .reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

function receiptModeLabel(receipt) {
  if (receipt.menuMode === 'night') return 'Ночное меню';
  if (receipt.menuMode === 'day') return 'Дневное меню';
  return 'Меню';
}

let currentFilter = 'all';
let searchQuery = '';

function getFilteredReceipts() {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);
  const weekStart = startOfWeek(now);

  return loadReceipts()
    .slice()
    .sort((a, b) => parseDate(b.date) - parseDate(a.date))
    .filter(receipt => {
      const date = parseDate(receipt.date);
      if (currentFilter === 'today' && date < today) return false;
      if (currentFilter === 'yesterday' && (date < yesterday || date > yesterdayEnd)) return false;
      if (currentFilter === 'week' && date < weekStart) return false;

      if (!searchQuery) return true;
      const itemNames = (Array.isArray(receipt.items) ? receipt.items : [])
        .map(item => item.name || '')
        .join(' ');
      const haystack = [genReceiptNum(receipt.id), receiptModeLabel(receipt), itemNames]
        .join(' ')
        .toLocaleLowerCase('ru-RU');
      return haystack.includes(searchQuery);
    });
}

function switchTab(tab) {
  ['receipts', 'stats'].forEach(name => {
    document.getElementById('tab-' + name)?.classList.toggle('active', name === tab);
    document.getElementById('section-' + name)?.classList.toggle('active', name === tab);
  });
  if (tab === 'stats') renderStats();
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(element => {
    element.classList.toggle('active', element.dataset.filter === filter);
  });
  renderReceipts();
}

function setSearch(value) {
  searchQuery = String(value || '').trim().toLocaleLowerCase('ru-RU');
  renderReceipts();
}

function renderOverview() {
  const all = loadReceipts();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayReceipts = all.filter(receipt => parseDate(receipt.date) >= today);
  const todayRevenue = todayReceipts.reduce((sum, receipt) => sum + receiptTotal(receipt), 0);

  const totalElement = document.getElementById('overview-total');
  const todayElement = document.getElementById('overview-today');
  const revenueElement = document.getElementById('overview-revenue');
  if (totalElement) totalElement.textContent = fmt.format(all.length);
  if (todayElement) todayElement.textContent = fmt.format(todayReceipts.length);
  if (revenueElement) revenueElement.textContent = fmtPrice(todayRevenue);
}

function renderReceipts() {
  const list = document.getElementById('receipts-list');
  if (!list) return;
  const receipts = getFilteredReceipts();
  const countElement = document.getElementById('receipt-result-count');
  if (countElement) countElement.textContent = `Найдено: ${receipts.length}`;

  if (!receipts.length) {
    list.innerHTML = `
      <div class="empty-receipts">
        <div class="empty-icon">🧾</div>
        <p>${searchQuery ? 'По вашему запросу чеков нет' : 'Сохранённых чеков пока нет'}</p>
      </div>`;
    return;
  }

  list.innerHTML = receipts.map((receipt, index) => {
    const items = Array.isArray(receipt.items) ? receipt.items : [];
    const itemCount = receiptItemCount(receipt);
    const encodedId = encodeURIComponent(String(receipt.id || ''));
    const cardId = String(receipt.id || index).replace(/[^a-zA-Z0-9_-]/g, '');
    const itemsHTML = items.map(item => {
      const qty = Number(item.qty) || 0;
      const lineTotal = Number(item.total) || (Number(item.price) || 0) * qty;
      return `
        <div class="receipt-item-row">
          <span class="receipt-item-name">${escapeHTML(item.name || 'Позиция')}</span>
          <span class="receipt-item-qty">${fmt.format(qty)} шт.</span>
          <span class="receipt-item-price">${fmtPrice(lineTotal)}</span>
        </div>`;
    }).join('');

    return `
      <details class="receipt-card" id="card-${cardId}" ${index === 0 && !searchQuery ? 'open' : ''}>
        <summary class="receipt-head">
          <div class="receipt-head-left">
            <span class="receipt-num">${genReceiptNum(receipt.id)}</span>
            <div class="receipt-meta">
              <div class="receipt-meta-top">Сохранённый чек · ${fmt.format(itemCount)} поз.</div>
              <div class="receipt-meta-sub"><span class="menu-mode-badge">${receiptModeLabel(receipt)}</span></div>
            </div>
          </div>
          <div class="receipt-head-right">
            <div>
              <div class="receipt-summary-total">${fmtPrice(receiptTotal(receipt))}</div>
              <div class="receipt-time">${fmtTime(receipt.date)} · ${fmtDateShort(receipt.date)}</div>
            </div>
            <span class="receipt-chevron" aria-hidden="true">⌄</span>
          </div>
        </summary>
        <div class="receipt-body">${itemsHTML || '<div class="empty-receipts">Нет позиций</div>'}</div>
        <div class="receipt-foot">
          <div class="receipt-foot-row">
            <span>Подытог</span><span>${fmtPrice(receipt.subtotal)}</span>
          </div>
          <div class="receipt-foot-row">
            <span>Обслуживание (15%)</span><span>${fmtPrice(receipt.service)}</span>
          </div>
          <div class="receipt-foot-total">
            <span class="receipt-foot-total-label">ИТОГО</span>
            <span class="receipt-foot-total-val">${fmtPrice(receiptTotal(receipt))}</span>
          </div>
          <button class="receipt-del-btn" type="button" onclick="deleteReceipt(decodeURIComponent('${encodedId}'))">Удалить чек</button>
        </div>
      </details>`;
  }).join('');
}

function deleteReceipt(id) {
  if (!confirm('Удалить этот сохранённый чек?')) return;
  saveAll(loadReceipts().filter(receipt => String(receipt.id) !== String(id)));
  refreshDashboard();
}

function clearAllReceipts() {
  if (!confirm('Удалить ВСЕ сохранённые чеки? Это действие нельзя отменить.')) return;
  localStorage.removeItem(STORAGE_KEY);
  refreshDashboard();
}

function renderStats() {
  const all = loadReceipts();
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = startOfWeek(now);

  const todayReceipts = all.filter(receipt => parseDate(receipt.date) >= todayStart);
  const todayRevenue = todayReceipts.reduce((sum, receipt) => sum + receiptTotal(receipt), 0);
  const todayCount = todayReceipts.length;
  const todayAverage = todayCount ? Math.round(todayRevenue / todayCount) : 0;
  const weekReceipts = all.filter(receipt => parseDate(receipt.date) >= weekStart);
  const weekRevenue = weekReceipts.reduce((sum, receipt) => sum + receiptTotal(receipt), 0);
  const allRevenue = all.reduce((sum, receipt) => sum + receiptTotal(receipt), 0);

  const grid = document.getElementById('stats-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="stat-card accent"><div class="stat-label">Выручка сегодня</div><div class="stat-value">${fmtPrice(todayRevenue)}</div></div>
      <div class="stat-card"><div class="stat-label">Чеков сегодня</div><div class="stat-value small">${fmt.format(todayCount)}</div></div>
      <div class="stat-card"><div class="stat-label">Средний чек</div><div class="stat-value small">${fmtPrice(todayAverage)}</div></div>
      <div class="stat-card"><div class="stat-label">Выручка за неделю</div><div class="stat-value small">${fmtPrice(weekRevenue)}</div></div>
      <div class="stat-card"><div class="stat-label">Чеков за неделю</div><div class="stat-value small">${fmt.format(weekReceipts.length)}</div></div>
      <div class="stat-card"><div class="stat-label">Всего выручка</div><div class="stat-value small">${fmtPrice(allRevenue)}</div></div>`;
  }

  const bars = document.getElementById('day-bars');
  if (!bars) return;
  const days = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const revenue = all
      .filter(receipt => {
        const receiptDate = parseDate(receipt.date);
        return receiptDate >= date && receiptDate < nextDate;
      })
      .reduce((sum, receipt) => sum + receiptTotal(receipt), 0);
    days.push({
      label: offset === 0 ? 'Сег' : date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      revenue
    });
  }

  const maxRevenue = Math.max(...days.map(day => day.revenue), 1);
  bars.innerHTML = days.map(day => {
    const percent = Math.round((day.revenue / maxRevenue) * 100);
    return `
      <div class="day-bar-row">
        <span class="day-bar-label">${day.label}</span>
        <div class="day-bar-wrap">
          <div class="day-bar-fill" style="width:${percent}%">${percent > 15 ? `<span class="day-bar-fill-val">${fmtPrice(day.revenue)}</span>` : ''}</div>
        </div>
        <span class="day-bar-val">${day.revenue > 0 && percent <= 15 ? fmtPrice(day.revenue) : ''}</span>
      </div>`;
  }).join('');
}

function refreshDashboard() {
  renderOverview();
  renderReceipts();
  if (document.getElementById('section-stats')?.classList.contains('active')) renderStats();
}

window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY) refreshDashboard();
});
window.addEventListener('pageshow', refreshDashboard);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshDashboard();
});

refreshDashboard();
