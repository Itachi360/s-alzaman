// ═══════════════════════════════════════════════════════════
//  Service Worker — أنوار العترة المطهرة  v11.0
//  إصلاح: أيقونات maskable بدون شفافية (سبب رفض التثبيت)
// ═══════════════════════════════════════════════════════════

const CACHE  = 'anwar-v11';

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icon.png',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
];

// ── INSTALL: تخزين كل الملفات المحلية ────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache =>
        Promise.allSettled(PRECACHE.map(url =>
          cache.add(url).catch(() => null)
        ))
      )
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: حذف الكاش القديم ───────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: Cache-First للمحلي، Network للخارجي ───────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // تجاهل غير HTTP وExtensions
  if (!e.request.url.startsWith('http')) return;
  if (url.protocol === 'chrome-extension:') return;

  // ── Google Fonts: Network أولاً ثم Cache ──
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        fetch(e.request)
          .then(res => {
            if (res && res.status === 200) cache.put(e.request, res.clone());
            return res;
          })
          .catch(() => cache.match(e.request))
      )
    );
    return;
  }

  // ── CDN (Tailwind / Lucide): Cache أولاً ──
  if (url.hostname.includes('cdn.tailwindcss.com') ||
      url.hostname.includes('unpkg.com') ||
      url.hostname.includes('cdn.jsdelivr.net')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => null);
      })
    );
    return;
  }

  // ── ملفات التطبيق المحلية: Cache-First ──
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() =>
          caches.match('/index.html')
        );
      })
    );
    return;
  }

  // ── باقي الطلبات: Network مع Offline Fallback ──
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request) || caches.match('/offline.html')
    )
  );
});

// ── Messages ──────────────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
