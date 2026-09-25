import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_RINGTONE } from '../lib/sound';
import type { Settings } from '../types';

// Ключ совпадает со скриптом в index.html (ранняя установка темы)
const STORAGE_KEY = 'spadmin.settings';

const DEFAULTS: Settings = {
  theme: 'system',
  sound: true,
  ringtone: DEFAULT_RINGTONE,
  volume: 0.8,
  repeatAlert: true,
  vibrate: true,
  keepAwake: false,
  desktopNotifications: true,
};

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
}

interface SettingsCtx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  resolvedTheme: 'light' | 'dark';
}

const Ctx = createContext<SettingsCtx | null>(null);

function useSystemTheme() {
  const mq = useMemo(() => window.matchMedia('(prefers-color-scheme: light)'), []);
  const [light, setLight] = useState(mq.matches);
  useEffect(() => {
    const on = () => setLight(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [mq]);
  return light ? 'light' : 'dark';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);
  const system = useSystemTheme();
  const resolvedTheme = settings.theme === 'system' ? system : settings.theme;

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* приватный режим — настройки живут до перезагрузки */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg || (resolvedTheme === 'light' ? '#f5f4f1' : '#101014'));
  }, [resolvedTheme]);

  const value = useMemo(() => ({ settings, update, resolvedTheme }), [settings, update, resolvedTheme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSettings must be used inside SettingsProvider');
  return v;
}
