// ─── NEXUS CRM Service Worker ───
// Provides full offline support with cache-first strategy

const CACHE_NAME = 'nexus-crm-v1';

// Core shell assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-512.png',
  '/manifest.json',
];

// ─── INSTALL: Pre-cache the app shell ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate immediately, don't wait for old SW to finish
  self.skipWaiting();
});

// ─── ACTIVATE: Clean up old caches ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// ─── FETCH: Cache-first with network fallback ───
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests (POST, etc.)
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version, but also update cache in background
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, cached version is already returned
          });

        return cachedResponse;
      }

      // No cache — try network, then cache the result
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline and nothing cached — return offline fallback for navigation
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // For other resources, return a simple offline response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
    })
  );
});

// ─── MESSAGE: Handle cache version updates ───
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
