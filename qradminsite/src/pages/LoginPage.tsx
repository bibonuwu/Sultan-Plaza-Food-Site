import { useState, type FormEvent } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { auth } from '../firebase';
import { unlockAudio } from '../lib/sound';
import { Spinner } from '../components/ui';

function authMessage(code?: string) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Неверный email или пароль.';
    case 'auth/invalid-email':
      return 'Некорректный email.';
    case 'auth/missing-password':
      return 'Введите пароль.';
    case 'auth/too-many-requests':
      return 'Слишком много попыток. Попробуйте через несколько минут.';
    case 'auth/network-request-failed':
      return 'Нет подключения к интернету.';
    case 'auth/user-disabled':
      return 'Аккаунт отключён администратором.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Вход по email не включён: Firebase Console → Authentication → Sign-in method → Email/Password.';
    default:
      return 'Не удалось войти. Попробуйте ещё раз.';
  }
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    unlockAudio(); // жест пользователя — разблокируем звук заранее
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(authMessage((err as { code?: string }).code));
      setBusy(false);
    }
  };

  const reset = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Введите email, и мы отправим ссылку для сброса пароля.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo(`Ссылка для сброса пароля отправлена на ${email.trim()}.`);
    } catch (err) {
      setError(authMessage((err as { code?: string }).code));
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit} noValidate>
        <img src="/logo.png" alt="Sultan Plaza Hotel" className="auth-logo" />
        <h1 className="auth-title">Панель заказов</h1>
        <p className="auth-sub">Вход для персонала</p>

        <label className="field">
          <span className="field-label">Email</span>
          <span className="input-wrap">
            <Mail size={18} aria-hidden />
            <input
              className="input"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@sultanplaza.kz"
            />
          </span>
        </label>

        <label className="field">
          <span className="field-label">Пароль</span>
          <span className="input-wrap">
            <Lock size={18} aria-hidden />
            <input
              className="input"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="icon-btn icon-btn-sm"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        {info && <div className="alert alert-ok">{info}</div>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy ? <Spinner size={20} label="Вход" /> : 'Войти'}
        </button>
        <button type="button" className="link-btn" onClick={reset}>
          Забыли пароль?
        </button>
      </form>
    </div>
  );
}
