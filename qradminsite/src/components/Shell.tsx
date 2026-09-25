import type { ReactNode } from 'react';
import { ChartColumn, ConciergeBell, Moon, Settings, Sun } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useSettings } from '../hooks/useSettings';
import type { Page } from '../types';

const NAV: Array<{ id: Page; label: string; icon: typeof ConciergeBell }> = [
  { id: 'orders', label: 'Заказы', icon: ConciergeBell },
  { id: 'stats', label: 'Статистика', icon: ChartColumn },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

function ConnectionPill() {
  const { loading, fromCache, online, error } = useOrders();
  const state = error || !online ? 'off' : loading || fromCache ? 'sync' : 'on';
  const label = state === 'on' ? 'Онлайн' : state === 'sync' ? 'Подключение…' : 'Нет связи';
  return (
    <span className={`conn conn-${state}`} title={label}>
      <span className="conn-dot" aria-hidden />
      <span className="conn-label">{label}</span>
    </span>
  );
}

function ThemeToggle() {
  const { resolvedTheme, update } = useSettings();
  const dark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => update({ theme: dark ? 'light' : 'dark' })}
      aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  email: string | null;
  children: ReactNode;
}

export function Shell({ page, onNavigate, email, children }: Props) {
  const { newOrders } = useOrders();
  const count = newOrders.length;

  const navButton = (n: (typeof NAV)[number], cls: string) => {
    const Icon = n.icon;
    return (
      <button
        key={n.id}
        type="button"
        className={`${cls} ${page === n.id ? 'is-active' : ''}`}
        aria-current={page === n.id ? 'page' : undefined}
        onClick={() => onNavigate(n.id)}
      >
        <span className="nav-icon">
          <Icon size={22} aria-hidden />
          {n.id === 'orders' && count > 0 && <span className="nav-count">{count > 99 ? '99+' : count}</span>}
        </span>
        <span className="nav-label">{n.label}</span>
      </button>
    );
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.png" alt="Sultan Plaza Hotel" className="brand-logo" />
          <span className="brand-sub">Панель заказов</span>
        </div>
        <nav className="side-nav" aria-label="Разделы">
          {NAV.map((n) => navButton(n, 'side-link'))}
        </nav>
        <div className="side-foot">
          <div className="side-row">
            <ConnectionPill />
            <ThemeToggle />
          </div>
          {email && (
            <div className="side-user" title={email}>
              {email}
            </div>
          )}
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <img src="/logo.png" alt="Sultan Plaza Hotel" className="topbar-logo" />
          <div className="topbar-right">
            <ConnectionPill />
            <ThemeToggle />
          </div>
        </header>
        <main className="main" id="main">
          {children}
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Разделы">
        {NAV.map((n) => navButton(n, 'bottom-link'))}
      </nav>
    </div>
  );
}
