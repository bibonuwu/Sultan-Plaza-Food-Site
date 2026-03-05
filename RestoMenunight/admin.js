/* ===== admin.js — Sultan Plaza Admin Panel ===== */

const STORAGE_KEY = 'sp_receipts';
const fmt = new Intl.NumberFormat();
const fmtPrice = v => fmt.format(v) + ' ₸';

/* ── helpers ── */
function loadReceipts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch (e) { return []; }
}

function saveAll(receipts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

function parseDate(iso) { return new Date(iso); }

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function startOfWeek(d) {
  const c = new Date(d);
  const day = c.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  c.setDate(c.getDate() + diff);
  c.setHours(0, 0, 0, 0);
  return c;
}

function fmtTime(iso) {
  const d = parseDate(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function fmtDateShort(iso) {
  const d = parseDate(iso);
  const today = new Date();
  if (isSameDay(d, today)) return 'Сегодня';
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (isSameDay(d, yest)) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

function genReceiptNum(id) {
  const ts = id.replace('rec_', '');
  return '#' + String(parseInt(ts, 10) % 100000).padStart(4, '0');
}

/* ── state ── */
let currentFilter = 'all';

function getFilteredReceipts() {
  const all = loadReceipts();
  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yest  = new Date(); yest.setDate(yest.getDate() - 1); yest.setHours(0, 0, 0, 0);
  const yestEnd = new Date(yest); yestEnd.setHours(23, 59, 59, 999);
  const weekStart = startOfWeek(now);

  return all.filter(r => {
    const d = parseDate(r.date);
    if (currentFilter === 'today')     return d >= today;
    if (currentFilter === 'yesterday') return d >= yest && d <= yestEnd;
    if (currentFilter === 'week')      return d >= weekStart;
    return true; // 'all'
  });
}

/* ── UI: tabs ── */
function switchTab(tab) {
  ['receipts', 'stats'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
    document.getElementById('section-' + t).classList.toggle('active', t === tab);
  });
  if (tab === 'stats') renderStats();
}

/* ── UI: filter chips ── */
function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-chip').forEach(el => {
    el.classList.toggle('active', el.dataset.filter === f);
  });
  renderReceipts();
}

/* ── Render: receipts list ── */
function renderReceipts() {
  const list = document.getElementById('receipts-list');
  if (!list) return;
  const receipts = getFilteredReceipts();

  if (receipts.length === 0) {
    list.innerHTML = `
      <div class="empty-receipts">
        <div class="empty-icon">🧾</div>
        <p>Чеков нет</p>
      </div>`;
    return;
  }

  list.innerHTML = receipts.map((r, idx) => {
    const num = genReceiptNum(r.id);
    const tableText = r.tableNum ? `Стол ${r.tableNum}` : 'Стол —';
    const waiterText = r.waiter   ? `Официант: ${r.waiter}` : 'Официант: —';
    const itemsHTML = (r.items || []).map(it => `
      <div class="receipt-item-row">
        <span class="receipt-item-name">${it.name}</span>
        <span class="receipt-item-qty">${it.qty} шт.</span>
        <span class="receipt-item-price">${fmtPrice(it.total)}</span>
      </div>`).join('');

    return `
      <div class="receipt-card" id="card-${r.id}">
        <div class="receipt-head">
          <div class="receipt-head-left">
            <span class="receipt-num">${num}</span>
            <div class="receipt-meta">
              <div class="receipt-meta-top">${tableText}</div>
              <div class="receipt-meta-sub">${waiterText}</div>
            </div>
          </div>
          <div class="receipt-time">
            <div>${fmtTime(r.date)}</div>
            <div class="receipt-date">${fmtDateShort(r.date)}</div>
          </div>
        </div>
        <div class="receipt-body">${itemsHTML}</div>
        <div class="receipt-foot">
          <div class="receipt-foot-row">
            <span>Подытог</span><span>${fmtPrice(r.subtotal)}</span>
          </div>
          <div class="receipt-foot-row">
            <span>Обслуживание (15%)</span><span>${fmtPrice(r.service)}</span>
          </div>
          <div class="receipt-foot-total">
            <span class="receipt-foot-total-label">ИТОГО</span>
            <span class="receipt-foot-total-val">${fmtPrice(r.total)}</span>
          </div>
          <button class="receipt-del-btn" onclick="deleteReceipt('${r.id}')">Удалить чек</button>
        </div>
      </div>`;
  }).join('');
}

/* ── Delete single receipt ── */
function deleteReceipt(id) {
  const all = loadReceipts();
  saveAll(all.filter(r => r.id !== id));
  renderReceipts();
  // refresh stats if visible
  if (document.getElementById('section-stats').classList.contains('active')) renderStats();
}

/* ── Clear all ── */
function clearAllReceipts() {
  if (!confirm('Удалить ВСЕ чеки? Это действие нельзя отменить.')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderReceipts();
  renderStats();
}

/* ── Render: statistics ── */
function renderStats() {
  const all = loadReceipts();
  const now  = new Date();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart  = startOfWeek(now);

  // today
  const todayRecs = all.filter(r => parseDate(r.date) >= todayStart);
  const todayRevenue = todayRecs.reduce((s, r) => s + r.total, 0);
  const todayCount   = todayRecs.length;
  const todayAvg     = todayCount ? Math.round(todayRevenue / todayCount) : 0;

  // week
  const weekRecs    = all.filter(r => parseDate(r.date) >= weekStart);
  const weekRevenue = weekRecs.reduce((s, r) => s + r.total, 0);
  const weekCount   = weekRecs.length;

  // all time
  const allRevenue = all.reduce((s, r) => s + r.total, 0);

  const grid = document.getElementById('stats-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="stat-card accent">
        <div class="stat-label">Выручка сегодня</div>
        <div class="stat-value">${fmtPrice(todayRevenue)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Чеков сегодня</div>
        <div class="stat-value small">${todayCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Средний чек</div>
        <div class="stat-value small">${fmtPrice(todayAvg)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Выручка за неделю</div>
        <div class="stat-value small">${fmtPrice(weekRevenue)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Чеков за неделю</div>
        <div class="stat-value small">${weekCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Всего выручка</div>
        <div class="stat-value small">${fmtPrice(allRevenue)}</div>
      </div>`;
  }

  // 7-day bar chart
  const bars = document.getElementById('day-bars');
  if (bars) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1);
      const rev = all
        .filter(r => { const rd = parseDate(r.date); return rd >= d && rd < nextD; })
        .reduce((s, r) => s + r.total, 0);
      const label = i === 0 ? 'Сег' : d.toLocaleDateString('ru-RU', { weekday: 'short' });
      days.push({ label, rev });
    }

    const maxRev = Math.max(...days.map(d => d.rev), 1);
    bars.innerHTML = days.map(d => {
      const pct = Math.round((d.rev / maxRev) * 100);
      return `
        <div class="day-bar-row">
          <span class="day-bar-label">${d.label}</span>
          <div class="day-bar-wrap">
            <div class="day-bar-fill" style="width:${pct}%">
              ${pct > 15 ? `<span class="day-bar-fill-val">${fmtPrice(d.rev)}</span>` : ''}
            </div>
          </div>
          <span class="day-bar-val">${d.rev > 0 && pct <= 15 ? fmtPrice(d.rev) : ''}</span>
        </div>`;
    }).join('');
  }
}

/* ── Init ── */
renderReceipts();
