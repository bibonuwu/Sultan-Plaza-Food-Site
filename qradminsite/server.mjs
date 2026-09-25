// Production-сервер для Firebase App Hosting (Cloud Run).
// Отдаёт собранное SPA из ./dist без внешних зависимостей:
//  - хешированные ассеты кэшируются навсегда,
//  - index.html / sw.js / manifest — всегда свежие,
//  - все неизвестные пути → index.html (SPA fallback).
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.json', '.webmanifest', '.svg', '.txt']);
const NO_CACHE = new Set(['/index.html', '/sw.js', '/manifest.webmanifest']);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

async function resolveFile(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const full = join(ROOT, safe);
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null; // защита от ../
  try {
    const s = await stat(full);
    if (s.isFile()) return { path: full, size: s.size, rel: '/' + safe.split(sep).join('/') };
  } catch {
    /* not found */
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
      return;
    }

    let file = url.pathname === '/' ? null : await resolveFile(url.pathname);
    if (!file) {
      // Отсутствующий ассет → 404, всё остальное — SPA
      if (/\.[a-z0-9]+$/i.test(url.pathname) && url.pathname !== '/') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS }).end('Not found');
        return;
      }
      file = await resolveFile('/index.html');
      if (!file) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Build not found. Run "npm run build".');
        return;
      }
    }

    const ext = extname(file.path).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      ...SECURITY_HEADERS,
    };
    if (NO_CACHE.has(file.rel)) headers['Cache-Control'] = 'no-cache';
    else if (file.rel.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    else headers['Cache-Control'] = 'public, max-age=86400';
    if (file.rel === '/sw.js') headers['Service-Worker-Allowed'] = '/';

    const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '') && file.size > 1024;
    if (gzip) {
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
    } else {
      headers['Content-Length'] = String(file.size);
    }

    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    const stream = createReadStream(file.path);
    stream.on('error', () => res.destroy());
    (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500).end();
    else res.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`Sultan Plaza admin is serving ./dist on :${PORT}`);
});
