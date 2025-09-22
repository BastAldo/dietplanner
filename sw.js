const CACHE_NAME = 'nutriplan-v1';
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
  'screenshots/screenshot_desktop.png',
  'screenshots/screenshot_mobile.png'
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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
