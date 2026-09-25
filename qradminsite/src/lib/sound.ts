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
  // iPhone (iOS 17+): сигнал звучит даже при включённом беззвучном режиме
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) {
    try {
      session.type = 'playback';
    } catch {
      /* не поддерживается */
    }
  }
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

/* ===================== Рингтоны ===================== */

/** Обертоны: [множитель частоты, громкость] */
type Partials = Array<[number, number]>;

interface Note {
  freq: number;
  /** начало, сек от старта мелодии */
  at: number;
  /** длительность затухания, сек */
  dur: number;
  partials: Partials;
  type?: OscillatorType;
  attack?: number;
  /** держать полную громкость столько секунд перед затуханием (гудки) */
  hold?: number;
}

const BELL: Partials = [
  [1, 0.55],
  [2.01, 0.16],
  [3.03, 0.06],
];
const DOORBELL: Partials = [
  [1, 0.6],
  [2, 0.18],
  [3, 0.07],
];
// Настольный звонок: негармонические обертоны металлической чаши
const DESK_BELL: Partials = [
  [1, 0.45],
  [2.76, 0.2],
  [5.4, 0.09],
  [8.93, 0.04],
];
const MARIMBA: Partials = [
  [1, 0.7],
  [3.9, 0.1],
];

const notes = (freqs: number[], step: number, dur: number, partials: Partials, type?: OscillatorType): Note[] =>
  freqs.map((freq, i) => ({ freq, at: i * step, dur, partials, type }));

export const RINGTONES = [
  {
    id: 'bell',
    label: 'Колокольчик',
    description: 'Мягкий тройной перезвон',
    notes: notes([1318.51, 1046.5, 1567.98], 0.2, 1.3, BELL),
  },
  {
    id: 'dingdong',
    label: 'Дин-дон',
    description: 'Как дверной звонок',
    notes: notes([659.25, 523.25], 0.45, 1.7, DOORBELL),
  },
  {
    id: 'desk',
    label: 'Звонок ресепшн',
    description: 'Настольный звонок отеля, два удара',
    notes: notes([2093, 2093], 0.32, 2.0, DESK_BELL),
  },
  {
    id: 'melody',
    label: 'Мелодия',
    description: 'Короткий восходящий перелив',
    notes: notes([1046.5, 1318.51, 1567.98, 2093], 0.13, 0.9, BELL, 'triangle'),
  },
  {
    id: 'marimba',
    label: 'Маримба',
    description: 'Тихий деревянный звук',
    notes: notes([783.99, 1046.5, 1318.51], 0.16, 0.55, MARIMBA),
  },
  {
    id: 'alarm',
    label: 'Тревога',
    description: 'Громкие сигналы — чтобы точно услышать',
    notes: [0, 0.18, 0.36, 0.72, 0.9, 1.08].map((at) => ({
      freq: 988,
      at,
      dur: 0.15,
      partials: [[1, 0.32]] as Partials,
      type: 'square' as OscillatorType,
      attack: 0.005,
      hold: 0.11,
    })),
  },
] as const satisfies ReadonlyArray<{ id: string; label: string; description: string; notes: Note[] }>;

export type RingtoneId = (typeof RINGTONES)[number]['id'];
export const DEFAULT_RINGTONE: RingtoneId = 'bell';

function playNote(c: BaseAudioContext, out: AudioNode, n: Note, start: number) {
  const at = start + n.at;
  const attack = n.attack ?? 0.012;
  for (const [mult, amp] of n.partials) {
    const osc = c.createOscillator();
    osc.type = n.type ?? 'sine';
    osc.frequency.value = n.freq * mult;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(amp, at + attack);
    if (n.hold) g.gain.setValueAtTime(amp, at + attack + n.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, at + n.dur);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + n.dur + 0.05);
  }
}

/** Запланировать мелодию в любом аудиоконтексте (в т.ч. OfflineAudioContext для проверки) */
export function scheduleRingtone(c: BaseAudioContext, id: RingtoneId | string, volume: number, start: number) {
  const tone = RINGTONES.find((r) => r.id === id) ?? RINGTONES[0];
  const master = c.createGain();
  master.gain.value = Math.max(0, Math.min(1, volume));
  master.connect(c.destination);
  tone.notes.forEach((n) => playNote(c, master, n, start));
}

/** Проиграть сигнал нового заказа */
export function playRingtone(id: RingtoneId | string = DEFAULT_RINGTONE, volume = 0.8) {
  const c = getCtx();
  if (!c) return;
  if (c.state !== 'running') c.resume().catch(() => undefined);
  scheduleRingtone(c, id, volume, c.currentTime + 0.03);
}

export function vibrate(pattern: number[] = [250, 100, 250, 100, 250]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* не поддерживается */
  }
}
