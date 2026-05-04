const CACHE = 'qr-gen-v5';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './assets/qrcode.min.keeex.js',
  './favicon.png',
  './favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './manifest.json',
  './assets/fonts/ubuntu-400-latin.woff2',
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
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
