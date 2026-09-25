import { useState, useSyncExternalStore } from 'react';
import { Download, Share, Volume2, X } from 'lucide-react';
import { isAudioReady, subscribeAudio, unlockAudio } from '../lib/sound';
import { promptInstall, useInstallState } from '../lib/pwa';
import { useSettings } from '../hooks/useSettings';

/** Браузер не даёт играть звук до первого касания — просим нажать */
export function AudioBanner() {
  const { settings } = useSettings();
  const ready = useSyncExternalStore(subscribeAudio, isAudioReady);
  if (!settings.sound || ready) return null;
  return (
    <button type="button" className="banner banner-warn" onClick={() => unlockAudio()}>
      <Volume2 size={20} aria-hidden />
      <span>
        <strong>Звук на паузе.</strong> Нажмите здесь, чтобы включить звуковой сигнал о новых заказах.
      </span>
    </button>
  );
}

const DISMISS_KEY = 'spadmin.installDismissed';

/** Подсказка установить приложение на телефон */
export function InstallBanner({ onOpenSettings }: { onOpenSettings: () => void }) {
  const install = useInstallState();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const mobile = install.platform !== 'desktop';
  if (dismissed || install.standalone || !mobile || (!install.canPrompt && install.platform !== 'ios')) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="banner banner-accent">
      <img src="/icons/icon-192.png" alt="" className="banner-app-icon" />
      <div className="banner-text">
        <strong>Установите приложение</strong>
        <span>Заказы будут приходить уведомлениями, даже когда телефон заблокирован.</span>
      </div>
      {install.canPrompt ? (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => promptInstall()}>
          <Download size={16} aria-hidden /> Установить
        </button>
      ) : (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenSettings}>
          <Share size={16} aria-hidden /> Как?
        </button>
      )}
      <button type="button" className="icon-btn icon-btn-sm" aria-label="Скрыть" onClick={dismiss}>
        <X size={16} />
      </button>
    </div>
  );
}
