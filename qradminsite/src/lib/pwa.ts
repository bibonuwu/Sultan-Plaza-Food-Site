// PWA: регистрация service worker и кнопка «Установить приложение» (Android / Chrome / Edge).
import { useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallState {
  /** браузер готов показать системный диалог установки */
  canPrompt: boolean;
  /** приложение запущено как установленное (с иконки) */
  standalone: boolean;
  /** установили в этой сессии */
  justInstalled: boolean;
  platform: 'android' | 'ios' | 'desktop';
}

let deferred: BeforeInstallPromptEvent | null = null;
let justInstalled = false;
const listeners = new Set<() => void>();

export const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isAndroid = () => /android/i.test(navigator.userAgent);
export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

function computeState(): InstallState {
  return {
    canPrompt: !!deferred,
    standalone: isStandalone(),
    justInstalled,
    platform: isAndroid() ? 'android' : isIos() ? 'ios' : 'desktop',
  };
}

let snapshot = computeState();
function emit() {
  snapshot = computeState();
  listeners.forEach((l) => l());
}

export function initPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // показываем свою кнопку вместо мини-баннера браузера
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    justInstalled = true;
    emit();
  });
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change', emit);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => console.warn('SW registration failed', err));
    });
  }
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable';
  const ev = deferred;
  deferred = null;
  emit();
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  return outcome;
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
  );
}
