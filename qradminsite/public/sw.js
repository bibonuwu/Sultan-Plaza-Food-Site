/* Sultan Plaza Admin — service worker
 * 1) Офлайн-оболочка приложения (PWA, установка на Android)
 * 2) Push-уведомления о новых заказах (Firebase Cloud Messaging, data-сообщения)
 */
const SHELL_CACHE = 'sp-shell-v1';
const RUNTIME_CACHE = 'sp-runtime-v1';
const RUNTIME_MAX_ENTRIES = 80;
const PRECACHE = ['/', '/manifest.webmanifest', '/logo.png', '/icons/icon-192.png', '/icons/badge-96.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('sp-') && !keep.has(k)).map((k) => caches.delete(k)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Firebase/Google API — всегда напрямую

  // Страницы: сначала сеть (всегда свежая версия), при офлайне — из кэша
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloaded = await event.preloadResponse;
          const res = preloaded || (await fetch(req));
          if (res.ok && (res.headers.get('content-type') || '').includes('text/html')) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put('/', copy));
          }
          return res;
        } catch {
          return (await caches.match('/')) || Response.error();
        }
      })(),
    );
    return;
  }

  // Хешированные файлы сборки не меняются → cache-first
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy).then(() => trimCache(RUNTIME_CACHE, RUNTIME_MAX_ENTRIES)));
        }
        return res;
      })(),
    );
    return;
  }

  // Иконки, логотип, манифест → stale-while-revalidate
  if (/\.(png|svg|jpg|jpeg|webp|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});

/* ===================== Push-уведомления ===================== */

function parsePush(event) {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch {
    return { data: { body: event.data.text() } };
  }
}

self.addEventListener('push', (event) => {
  const payload = parsePush(event);
  const data = payload.data || {};
  const n = payload.notification || {};
  const title = n.title || data.title || 'Новый заказ';
  const body = n.body || data.body || 'Откройте приложение, чтобы посмотреть заказ';
  const url = data.url || '/';

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      windows.forEach((c) => c.postMessage({ type: 'push', data }));
      // Приложение открыто и на экране — звук и баннер покажет само приложение
      if (windows.some((c) => c.visibilityState === 'visible' && c.focused)) return;

      // Вкладка могла уже показать это уведомление сама — не дублируем
      const tag = data.orderId ? `order-${data.orderId}` : 'sp-order';
      if (data.orderId && (await self.registration.getNotifications({ tag })).length) return;

      await self.registration.showNotification(title, {
        body,
        tag,
        renotify: true,
        requireInteraction: true,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-96.png',
        vibrate: [300, 120, 300, 120, 300],
        timestamp: Date.now(),
        data: { url, orderId: data.orderId || null },
        actions: [{ action: 'open', title: 'Открыть заказ' }],
      });
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const info = event.notification.data || {};
  const target = new URL(info.url || '/', self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = windows.find((c) => new URL(c.url).origin === self.location.origin);
      if (existing) {
        await existing.focus();
        existing.postMessage({ type: 'open-order', orderId: info.orderId || null });
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
