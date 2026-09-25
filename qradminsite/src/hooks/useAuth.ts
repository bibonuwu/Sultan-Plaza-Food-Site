import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'checking'; user: User }
  | { status: 'no-access'; user: User }
  | { status: 'error'; user: User; message: string }
  | { status: 'ready'; user: User };

/** Авторизация + проверка, что пользователь есть в списке сотрудников (staff/{uid}) */
export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setState({ status: 'signed-out' });
        return;
      }
      setState({ status: 'checking', user });
      try {
        const staff = await getDoc(doc(db, 'staff', user.uid));
        if (cancelled) return;
        setState(staff.exists() ? { status: 'ready', user } : { status: 'no-access', user });
      } catch (err) {
        if (cancelled) return;
        const code = (err as { code?: string }).code;
        setState(
          code === 'permission-denied'
            ? { status: 'no-access', user }
            : { status: 'error', user, message: 'Нет связи с сервером. Проверьте интернет.' },
        );
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { state, retry };
}
