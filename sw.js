const CACHE_NAME = 'healtypro-v8';
const APP_SHELL_FILES = [
  '.',
  'index.html',
  'styles/base.css',
  'styles/planner.css',
  'styles/progress.css',
  'styles/modals.css',
  'styles/charts.css',
  'styles/recipes.css',
  'templates/planner.html',
  'templates/progress.html',
  'templates/profile.html',
  'templates/charts.html',
  'templates/recipes.html',
  'templates/modals.html',
  'src/main.js',
  'src/api/configService.js',
  'src/core/state.js',
  'src/core/calculations.js',
  'src/core/validation.js',
  'src/ui/interactions.js',
  'src/ui/notifications.js',
  'src/ui/renderer.js',
  'src/ui/modals.js',
  'src/ui/plannerRenderer.js',
  'src/ui/pageRenderers.js',
  'src/ui/recipesRenderer.js',
  'src/ui/charts.js',
  'src/ui/viewLoader.js',
  'src/ui/icons.js',
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
          return cacheName !== CACHE_NAME;
        }).map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
