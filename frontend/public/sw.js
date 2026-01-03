const CACHE_NAME = 'softcon-v1';

// With Vite, built JS/CSS assets are hashed, so don't hardcode them here.
// Pre-cache only stable URLs.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/REDISEÑO_ICONO.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Cache a copy of successful same-origin responses
          try {
            const url = new URL(event.request.url);
            if (url.origin === self.location.origin && response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
            }
          } catch {
            // ignore URL parsing/caching errors
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
