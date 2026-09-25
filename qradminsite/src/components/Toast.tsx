import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { BellRing, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

export type ToastTone = 'info' | 'success' | 'error' | 'order';

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastInput {
  id: number;
}

const Ctx = createContext<((t: ToastInput) => void) | null>(null);

const ICONS = { info: Info, success: CircleCheck, error: TriangleAlert, order: BellRing };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (t: ToastInput) => {
      const id = ++seq.current;
      const tone = t.tone ?? 'info';
      setItems((list) => [...list.slice(-3), { ...t, tone, id }]);
      const duration = t.durationMs ?? (tone === 'order' ? 10_000 : tone === 'error' ? 6000 : 3500);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toasts" role="region" aria-label="Уведомления" aria-live="polite">
        {items.map((t) => {
          const Icon = ICONS[t.tone ?? 'info'];
          return (
            <div key={t.id} className={`toast toast-${t.tone}`} role={t.tone === 'error' ? 'alert' : 'status'}>
              <Icon className="toast-icon" size={20} aria-hidden />
              <div className="toast-body">
                <div className="toast-title">{t.title}</div>
                {t.description && <div className="toast-desc">{t.description}</div>}
              </div>
              {t.action && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <button type="button" className="icon-btn icon-btn-sm" aria-label="Закрыть" onClick={() => dismiss(t.id)}>
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be used inside ToastProvider');
  return v;
}
