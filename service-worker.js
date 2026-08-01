const CACHE_NAME = 'melodicaine-v23-mobile-volume-no-album-sort';
const APP_SHELL = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/melodicaine.ico', './assets/logo.png', './assets/title.png', './assets/ui/back.png', './assets/ui/cog.png', './assets/ui/forward.png', './assets/ui/pause.png', './assets/ui/play.png', './assets/ui/repeat1.png', './assets/ui/repeatoff.png', './assets/ui/repeaton.png', './assets/ui/shuffleoff.png', './assets/ui/shuffleon.png', './assets/ui/volumeloud.png', './assets/ui/volumelow.png', './assets/ui/volumemedium.png', './assets/ui/add.png', './assets/ui/loveoff.png', './assets/ui/loveon.png'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
});
