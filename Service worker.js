// БИОСЛЕД — простой service worker для установки как PWA и базового офлайн-кэша оболочки.
const CACHE_NAME = 'biosled-v1';
const SHELL = ['./biosled.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API calls, cache-first for the app shell.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('api.anthropic.com') || url.includes('openstreetmap.org')) {
    return; // always go to network for live data / map tiles
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});