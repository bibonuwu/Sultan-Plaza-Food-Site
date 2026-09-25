import { signOut, type User } from 'firebase/auth';
import { Copy, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';
import { auth } from '../firebase';
import { useToast } from '../components/Toast';

/** Пользователь вошёл, но не добавлен в staff — показываем, как выдать доступ */
export function NoAccessPage({ user, onRetry }: { user: User; onRetry: () => void }) {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(user.uid);
      toast({ tone: 'success', title: 'UID скопирован' });
    } catch {
      toast({ tone: 'error', title: 'Не удалось скопировать' });
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card auth-card-wide">
        <div className="auth-icon auth-icon-warn">
          <ShieldAlert size={32} aria-hidden />
        </div>
        <h1 className="auth-title">Нет доступа к заказам</h1>
        <p className="auth-sub">
          Аккаунт <strong>{user.email}</strong> ещё не добавлен в список сотрудников.
        </p>

        <ol className="steps">
          <li>
            Откройте <strong>Firebase Console → Firestore Database → Данные</strong>.
          </li>
          <li>
            Создайте коллекцию <code>staff</code> (если её нет).
          </li>
          <li>
            Добавьте документ, где <strong>ID документа</strong> = UID ниже, и поле <code>name</code> (string) с именем
            сотрудника.
          </li>
          <li>Нажмите «Проверить снова».</li>
        </ol>

        <div className="link-box">
          <code className="link-box-url">{user.uid}</code>
          <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
            <Copy size={16} aria-hidden /> UID
          </button>
        </div>

        <div className="btn-row btn-row-center">
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            <RefreshCw size={18} aria-hidden /> Проверить снова
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => signOut(auth)}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

export function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-icon auth-icon-warn">
          <WifiOff size={32} aria-hidden />
        </div>
        <h1 className="auth-title">Нет соединения</h1>
        <p className="auth-sub">{message}</p>
        <div className="btn-row btn-row-center">
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            <RefreshCw size={18} aria-hidden /> Повторить
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => signOut(auth)}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
