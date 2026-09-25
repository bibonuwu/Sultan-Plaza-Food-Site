import { useEffect } from 'react';

/** Не давать экрану гаснуть (планшет на ресепшене / кухне) */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let disposed = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible' || lock) return;
      try {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => {
          lock = null;
        });
        if (disposed) lock.release().catch(() => undefined);
      } catch {
        /* например, режим энергосбережения */
      }
    };

    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', acquire);
      lock?.release().catch(() => undefined);
    };
  }, [enabled]);
}
