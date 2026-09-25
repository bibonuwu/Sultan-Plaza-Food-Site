// Звуковой сигнал о новом заказе. Синтезируется через Web Audio API —
// без аудиофайлов, работает офлайн. Браузеры разрешают звук только после
// первого касания/клика пользователя, поэтому контекст «разблокируется» при взаимодействии.

type Listener = () => void;

let ctx: AudioContext | null = null;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const AC =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  ctx.onstatechange = emit;
  return ctx;
}

export function isAudioReady() {
  return !!ctx && ctx.state === 'running';
}

export function subscribeAudio(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export async function unlockAudio() {
  const c = getCtx();
  if (!c) return false;
  if (c.state !== 'running') {
    try {
      await c.resume();
    } catch {
      /* ждём следующего жеста */
    }
  }
  emit();
  return c.state === 'running';
}

/** Разблокировать звук при первом касании/клике/клавише */
export function installAudioUnlock() {
  const handler = () => {
    unlockAudio().then((ok) => {
      if (!ok) return;
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    });
  };
  window.addEventListener('pointerdown', handler);
  window.addEventListener('keydown', handler);
}

function bell(c: AudioContext, out: AudioNode, freq: number, at: number) {
  // Колокольчик: основной тон + два обертона с экспоненциальным затуханием
  const partials: Array<[number, number]> = [
    [1, 0.55],
    [2.01, 0.16],
    [3.03, 0.06],
  ];
  for (const [mult, amp] of partials) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(amp, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.3);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + 1.35);
  }
}

/** «Динь-дон-динь» — сигнал нового заказа */
export function playChime(volume = 0.8) {
  const c = getCtx();
  if (!c) return;
  if (c.state !== 'running') c.resume().catch(() => undefined);
  const master = c.createGain();
  master.gain.value = Math.max(0, Math.min(1, volume));
  master.connect(c.destination);
  const t = c.currentTime + 0.03;
  bell(c, master, 1318.51, t); // E6
  bell(c, master, 1046.5, t + 0.2); // C6
  bell(c, master, 1567.98, t + 0.4); // G6
}

export function vibrate(pattern: number[] = [250, 100, 250, 100, 250]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* не поддерживается */
  }
}
