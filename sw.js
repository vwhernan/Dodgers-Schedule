const CACHE_NAME = 'dodgers-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './hello.png',
  './DodgersStyle.css',
  './DodgersScript.js',
  './DodgerStadium.png'
];

// Install the service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Basic fetch logic to make Chrome happy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
