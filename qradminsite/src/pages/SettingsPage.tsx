import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { signOut, type User } from 'firebase/auth';
import {
  BellOff,
  BellRing,
  CircleCheck,
  Copy,
  Database,
  Download,
  LogOut,
  Monitor,
  Moon,
  Play,
  Share,
  Smartphone,
  SquarePlus,
  Sun,
  Trash2,
  TriangleAlert,
  Volume2,
} from 'lucide-react';
import { auth } from '../firebase';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../components/Toast';
import { Modal, Segmented, Spinner, Switch } from '../components/ui';
import { countOrders, deleteOrders, type DeleteScope } from '../lib/orders';
import { plural } from '../lib/format';
import { promptInstall, useInstallState } from '../lib/pwa';
import { playRingtone, RINGTONES, unlockAudio, vibrate } from '../lib/sound';
import {
  disablePush,
  enablePush,
  getPushSupport,
  getSavedToken,
  notificationPermission,
  PushError,
  showTestNotification,
  type PushSupport,
} from '../lib/push';
import { APP_VERSION, BUILD_TIME, firebaseConfig, MAX_STORED_ORDERS } from '../config';
import type { ThemeMode } from '../types';

function Section({ title, icon, children, id }: { title: string; icon: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="card settings-card" id={id}>
      <h2 className="card-title">
        <span className="card-title-icon" aria-hidden>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ---------- Установка приложения ---------- */
// На iPhone нет кнопки установки из браузера — только через меню «Поделиться» в Safari.
// Push-уведомления на iOS работают с версии 16.4 и только в установленном приложении.
function IosSteps() {
  return (
    <ol className="steps">
      <li>
        Откройте этот сайт в <strong>Safari</strong>.
      </li>
      <li>
        Нажмите «Поделиться» <Share size={16} className="inline-ic" aria-label="значок Поделиться" /> внизу экрана.
      </li>
      <li>
        Выберите «На экран Домой» <SquarePlus size={16} className="inline-ic" aria-label="значок Добавить" /> →
        «Добавить».
      </li>
      <li>
        Откройте «SP Заказы» с экрана «Домой» → Настройки → <strong>«Включить уведомления»</strong> (нужен iOS 16.4
        или новее).
      </li>
    </ol>
  );
}
function InstallSection() {
  const install = useInstallState();
  const toast = useToast();
  const url = window.location.origin;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ tone: 'success', title: 'Ссылка скопирована' });
    } catch {
      toast({ tone: 'error', title: 'Не удалось скопировать', description: url });
    }
  };

  let body: ReactNode;
  if (install.standalone || install.justInstalled) {
    body = (
      <div className="status-line status-ok">
        <CircleCheck size={20} aria-hidden />
        <span>
          {install.standalone
            ? 'Вы используете установленное приложение.'
            : 'Приложение установлено! Откройте «SP Заказы» с главного экрана.'}
        </span>
      </div>
    );
  } else if (install.platform === 'ios') {
    body = <IosSteps />;
  } else if (install.canPrompt) {
    body = (
      <>
        <p className="muted">
          Приложение появится на главном экране {install.platform === 'android' ? 'телефона' : 'устройства'}, будет
          открываться в отдельном окне и получать уведомления о заказах.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={async () => {
            const res = await promptInstall();
            if (res === 'accepted') toast({ tone: 'success', title: 'Устанавливаем приложение…' });
          }}
        >
          <Download size={20} aria-hidden /> Скачать приложение{install.platform === 'android' ? ' для Android' : ''}
        </button>
      </>
    );
  } else if (install.platform === 'android') {
    body = (
      <ol className="steps">
        <li>
          Откройте этот сайт в <strong>Google Chrome</strong>.
        </li>
        <li>Нажмите меню ⋮ в правом верхнем углу.</li>
        <li>Выберите «Установить приложение» или «Добавить на главный экран».</li>
      </ol>
    );
  } else {
    body = (
      <>
        <p className="muted">Откройте ссылку ниже на телефоне:</p>
        <div className="install-platform">
          <div className="install-platform-title">Android</div>
          <p className="muted small">
            В Google Chrome → Настройки → кнопка «Скачать приложение для Android».
          </p>
        </div>
        <div className="install-platform">
          <div className="install-platform-title">iPhone / iPad</div>
          <IosSteps />
        </div>
      </>
    );
  }

  const title =
    install.platform === 'ios'
      ? 'Приложение для iPhone'
      : install.platform === 'android'
        ? 'Приложение для Android'
        : 'Приложение для телефона';

  return (
    <Section title={title} icon={<Smartphone size={20} />} id="install">
      {body}
      <div className="link-box">
        <span className="link-box-url">{url}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
          <Copy size={16} aria-hidden /> Копировать
        </button>
      </div>
    </Section>
  );
}

/* ---------- Уведомления ---------- */
function NotificationsSection({ user }: { user: User }) {
  const { settings, update } = useSettings();
  const toast = useToast();
  const [support, setSupport] = useState<PushSupport | null>(null);
  const [enabled, setEnabled] = useState(() => !!getSavedToken() && notificationPermission() === 'granted');
  const [busy, setBusy] = useState(false);
  const permission = notificationPermission();

  useEffect(() => {
    getPushSupport().then(setSupport);
  }, []);

  const turnOn = async () => {
    setBusy(true);
    try {
      await enablePush(user);
      setEnabled(true);
      toast({ tone: 'success', title: 'Уведомления включены', description: 'Новые заказы будут приходить на это устройство.' });
    } catch (err) {
      const code = err instanceof PushError ? err.code : 'failed';
      toast({
        tone: 'error',
        title: 'Не удалось включить уведомления',
        description:
          code === 'denied'
            ? 'Уведомления запрещены. Разрешите их в настройках сайта (значок 🔒 в адресной строке).'
            : code === 'dismissed'
              ? 'Вы закрыли запрос разрешения. Попробуйте ещё раз.'
              : code === 'unsupported'
                ? 'Этот браузер не поддерживает push-уведомления.'
                : 'Проверьте интернет и попробуйте ещё раз.',
      });
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    await disablePush();
    setEnabled(false);
    setBusy(false);
    toast({ tone: 'info', title: 'Уведомления на этом устройстве отключены' });
  };

  const test = async () => {
    try {
      await showTestNotification();
    } catch {
      toast({ tone: 'error', title: 'Сначала разрешите уведомления' });
    }
  };

  let status: ReactNode;
  if (support === null) status = <Spinner size={18} />;
  else if (support === 'ios-install-first')
    status = (
      <div className="status-line status-warn">
        <TriangleAlert size={20} aria-hidden />
        <span>На iPhone уведомления работают только в установленном приложении — сначала добавьте его на экран «Домой».</span>
      </div>
    );
  else if (support === 'unsupported')
    status = (
      <div className="status-line status-warn">
        <TriangleAlert size={20} aria-hidden />
        <span>Этот браузер не поддерживает push-уведомления. Используйте Google Chrome.</span>
      </div>
    );
  else if (permission === 'denied')
    status = (
      <div className="status-line status-error">
        <BellOff size={20} aria-hidden />
        <span>Уведомления заблокированы в браузере. Разрешите их в настройках сайта и обновите страницу.</span>
      </div>
    );
  else if (enabled)
    status = (
      <div className="status-line status-ok">
        <CircleCheck size={20} aria-hidden />
        <span>Включены на этом устройстве — заказы придут, даже если приложение закрыто.</span>
      </div>
    );
  else
    status = (
      <div className="status-line">
        <BellOff size={20} aria-hidden />
        <span>Выключены на этом устройстве.</span>
      </div>
    );

  return (
    <Section title="Уведомления" icon={<BellRing size={20} />}>
      {status}
      <div className="btn-row">
        {support === 'supported' && permission !== 'denied' && !enabled && (
          <button type="button" className="btn btn-primary" onClick={turnOn} disabled={busy}>
            {busy ? <Spinner size={18} /> : <BellRing size={18} aria-hidden />} Включить уведомления
          </button>
        )}
        {enabled && (
          <button type="button" className="btn btn-secondary" onClick={turnOff} disabled={busy}>
            <BellOff size={18} aria-hidden /> Отключить
          </button>
        )}
        {permission === 'granted' && (
          <button type="button" className="btn btn-ghost" onClick={test}>
            Проверить
          </button>
        )}
      </div>
      <Switch
        checked={settings.desktopNotifications}
        onChange={(v) => update({ desktopNotifications: v })}
        label="Уведомления, когда вкладка свёрнута"
        description="Системное уведомление, если админка открыта в фоне."
      />
    </Section>
  );
}

/* ---------- Выбор мелодии сигнала ---------- */
function RingtonePicker({
  value,
  volume,
  disabled,
  onChange,
}: {
  value: string;
  volume: number;
  disabled: boolean;
  onChange: (id: string) => void;
}) {
  return (
    <div className="ringtones" role="radiogroup" aria-label="Мелодия сигнала">
      {RINGTONES.map((r) => {
        const active = r.id === value;
        return (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            className={`ringtone ${active ? 'is-active' : ''}`}
            onClick={async () => {
              onChange(r.id);
              await unlockAudio();
              playRingtone(r.id, volume);
            }}
          >
            <span className="ringtone-radio" aria-hidden />
            <span className="ringtone-text">
              <span className="ringtone-label">{r.label}</span>
              <span className="ringtone-desc">{r.description}</span>
            </span>
            <Play size={16} className="ringtone-play" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Данные и хранение ---------- */
function DataSection() {
  const toast = useToast();
  const [count, setCount] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<DeleteScope | null>(null);
  const [resetNumbering, setResetNumbering] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    countOrders()
      .then(setCount)
      .catch(() => setCount(null));
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      const reset = confirm === 'all' && resetNumbering;
      const n = await deleteOrders(confirm, reset);
      toast({
        tone: 'success',
        title: n ? `Удалено: ${n} ${plural(n, 'заказ', 'заказа', 'заказов')}` : 'Нечего удалять',
        description: reset ? 'Нумерация начнётся заново с №1.' : undefined,
      });
      setConfirm(null);
      refresh();
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', title: 'Не удалось удалить заказы', description: 'Проверьте интернет и попробуйте ещё раз.' });
    } finally {
      setBusy(false);
    }
  };

  const fill = count === null ? 0 : Math.min(100, (count / MAX_STORED_ORDERS) * 100);

  return (
    <Section title="Данные и хранение" icon={<Database size={20} />}>
      <p className="muted">
        В базе хранятся только последние {MAX_STORED_ORDERS} заказов — более старые удаляются автоматически. Так
        Firestore остаётся в бесплатном лимите Firebase.
      </p>
      <div className="storage">
        <div className="storage-head">
          <span>Сейчас в базе</span>
          <strong>
            {count === null ? '…' : count} из {MAX_STORED_ORDERS}
          </strong>
        </div>
        <div className="hbar-track" aria-hidden>
          <div className="hbar-fill" style={{ width: `${fill}%` }} />
        </div>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={() => setConfirm('finished')}>
          <Trash2 size={18} aria-hidden /> Удалить выполненные и отменённые
        </button>
        <button type="button" className="btn btn-ghost btn-danger-text" onClick={() => setConfirm('all')}>
          <Trash2 size={18} aria-hidden /> Удалить все заказы
        </button>
      </div>

      <Modal
        open={confirm !== null}
        onClose={() => !busy && setConfirm(null)}
        title={confirm === 'all' ? 'Удалить все заказы?' : 'Удалить завершённые заказы?'}
        footer={
          <>
            <span className="spacer" />
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)} disabled={busy}>
              Отмена
            </button>
            <button type="button" className="btn btn-danger" onClick={run} disabled={busy}>
              {busy ? <Spinner size={18} /> : <Trash2 size={18} aria-hidden />} Удалить навсегда
            </button>
          </>
        }
      >
        {confirm === 'all' ? (
          <>
            <p>
              Все заказы, <strong>включая новые и ещё не доставленные</strong>, будут удалены из базы навсегда.
              Статистика обнулится.
            </p>
            <label className="check-row">
              <input type="checkbox" checked={resetNumbering} onChange={(e) => setResetNumbering(e.target.checked)} />
              <span>Начать нумерацию заново с №1</span>
            </label>
          </>
        ) : (
          <p>
            Будут удалены заказы со статусом «Выполнен» и «Отменён». Новые и активные заказы останутся.
          </p>
        )}
      </Modal>
    </Section>
  );
}

/* ---------- Страница ---------- */
export function SettingsPage({ user }: { user: User }) {
  const { settings, update } = useSettings();
  const wakeLockSupported = 'wakeLock' in navigator;

  const logout = async () => {
    await disablePush(); // этот телефон больше не должен получать заказы
    await signOut(auth);
  };

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <div>
          <h1 className="page-title">Настройки</h1>
          <p className="page-sub">Настройки сохраняются на этом устройстве</p>
        </div>
      </div>

      <InstallSection />

      <NotificationsSection user={user} />

      <Section title="Звуковой сигнал" icon={<Volume2 size={20} />}>
        <Switch
          checked={settings.sound}
          onChange={(v) => update({ sound: v })}
          label="Звук при новом заказе"
          description="Выбранная мелодия прозвучит, как только гость отправит заказ."
        />
        <div className={`setting-block ${settings.sound ? '' : 'is-disabled'}`}>
          <div className="setting-text">
            <div className="setting-label">Мелодия сигнала</div>
            <div className="setting-desc">Нажмите на вариант, чтобы выбрать и прослушать.</div>
          </div>
          <RingtonePicker
            value={settings.ringtone}
            volume={settings.volume}
            disabled={!settings.sound}
            onChange={(ringtone) => update({ ringtone })}
          />
          <p className="setting-desc">
            Когда приложение закрыто, звучит обычный звук уведомлений телефона. На Android его можно сменить: Настройки
            телефона → Приложения → «SP Заказы» → Уведомления → Звук.
          </p>
        </div>
        <div className={`setting-row ${settings.sound ? '' : 'is-disabled'}`}>
          <div className="setting-text">
            <label htmlFor="volume" className="setting-label">
              Громкость
            </label>
          </div>
          <input
            id="volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            disabled={!settings.sound}
            onChange={(e) => update({ volume: Number(e.target.value) })}
            className="range"
          />
        </div>
        <Switch
          checked={settings.repeatAlert}
          onChange={(v) => update({ repeatAlert: v })}
          disabled={!settings.sound}
          label="Повторять, пока заказ не принят"
          description="Сигнал каждые 20 секунд, пока есть заказы со статусом «Новый»."
        />
        <Switch
          checked={settings.vibrate}
          onChange={(v) => update({ vibrate: v })}
          label="Вибрация"
          description="На телефонах Android."
        />
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              await unlockAudio();
              playRingtone(settings.ringtone, settings.volume);
              if (settings.vibrate) vibrate();
            }}
          >
            <Volume2 size={18} aria-hidden /> Проверить звук
          </button>
        </div>
      </Section>

      <Section title="Оформление" icon={<Sun size={20} />}>
        <Segmented<ThemeMode>
          ariaLabel="Тема"
          value={settings.theme}
          onChange={(theme) => update({ theme })}
          options={[
            { value: 'light', label: 'Светлая', icon: <Sun size={16} aria-hidden /> },
            { value: 'dark', label: 'Тёмная', icon: <Moon size={16} aria-hidden /> },
            { value: 'system', label: 'Системная', icon: <Monitor size={16} aria-hidden /> },
          ]}
        />
        <Switch
          checked={settings.keepAwake}
          onChange={(v) => update({ keepAwake: v })}
          disabled={!wakeLockSupported}
          label="Не выключать экран"
          description={
            wakeLockSupported
              ? 'Для планшета на ресепшене или кухне: экран не гаснет, пока открыта админка.'
              : 'Не поддерживается этим браузером.'
          }
        />
      </Section>

      <DataSection />

      <Section title="Аккаунт" icon={<LogOut size={20} />}>
        <div className="account">
          <div>
            <div className="account-email">{user.email}</div>
            <div className="muted small">Сотрудник · проект {firebaseConfig.projectId}</div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={logout}>
            <LogOut size={18} aria-hidden /> Выйти
          </button>
        </div>
      </Section>

      <p className="about muted small">
        Sultan Plaza — Заказы · версия {APP_VERSION} · сборка {new Date(BUILD_TIME).toLocaleString('ru-RU')}
      </p>
    </div>
  );
}
