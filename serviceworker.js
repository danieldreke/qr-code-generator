const CACHE = 'qr-gen-v15';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './assets/qrcodegen-nayuki.js',
  './favicon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './manifest.json',
  './assets/fonts/ubuntu-400-latin.woff2',
  './assets/fonts/ubuntu-mono-400-latin.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const isNavigation = e.request.mode === 'navigate';
  if (isNavigation) {
    // Network-first for HTML: reload always fetches fresh content when online
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for static assets
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
