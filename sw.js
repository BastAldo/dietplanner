const CACHE_NAME = 'healtypro-v3';
const APP_SHELL_FILES = [
  '.',
  'index.html',
  'style.css',
  'src/main.js',
  'src/api/configService.js',
  'src/core/state.js',
  'src/core/validation.js',
  'src/ui/interactions.js',
  'src/ui/notifications.js',
  'src/ui/renderer.js',
  'src/utils/constants.js',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'screenshots/screen_desktop.png',
  'screenshots/screen_mobile.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_FILES);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          // Return true if you want to remove this cache,
          // and false otherwise.
          return cacheName !== CACHE_NAME;
        }).map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only apply cache-first strategy to same-origin requests.
  // This prevents errors with cross-origin requests like Google Fonts or remote JSON files.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  } else {
    // For all other requests, go to the network directly.
    event.respondWith(fetch(event.request));
  }
});
