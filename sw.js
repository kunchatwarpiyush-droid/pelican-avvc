// ============================================================
// Pelican AV/VC Manager — Service Worker
// Offline-first, background sync, periodic sync support
// ============================================================

const CACHE_NAME     = 'pelican-avvc-v2';
const STATIC_ASSETS  = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── INSTALL: cache all static assets ────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('[SW] Install cache failed (non-fatal):', err);
        self.skipWaiting();
      })
  );
});

// ── ACTIVATE: clean up old caches ───────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k  => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: network-first for API, cache-first for assets ────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Skip non-GET and non-http requests
  if (event.request.method !== 'GET') return;
  if (!url.startsWith('http'))         return;

  // Google Apps Script calls: network only (never cache API)
  if (url.includes('script.google.com')) {
    event.respondWith(fetch(event.request).catch(() =>
      new Response(JSON.stringify({ success: false, error: 'offline' }),
        { headers: { 'Content-Type': 'application/json' } })
    ));
    return;
  }

  // Google Fonts: cache first
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // All other requests: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request)
          .then(response => {
            if (response && response.status === 200 && response.type !== 'opaque') {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached || new Response('Offline', { status: 503 }));

        return cached || networkFetch;
      })
    )
  );
});

// ── BACKGROUND SYNC: retry failed GAS writes ────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sheets') {
    event.waitUntil(syncPendingWrites());
  }
});

async function syncPendingWrites() {
  // Notify all clients to flush their queues
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'SYNC_REQUESTED' }));
}

// ── PERIODIC SYNC: refresh data every hour ──────────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'refresh-data') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'PERIODIC_REFRESH' }))
      )
    );
  }
});

// ── PUSH NOTIFICATIONS ───────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Pelican AV/VC', body: 'You have an update.' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Pelican AV/VC', {
      body:    data.body    || '',
      icon:    './icon-192.png',
      badge:   './icon-96.png',
      vibrate: [100, 50, 100],
      data:    { url: data.url || './' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || './')
  );
});

// ── MESSAGE from main thread ─────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
