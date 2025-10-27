const CACHE_NAME = 'healtypro-v18';
const APP_SHELL_FILES = [
  '.',
  'index.html',
  'styles/base.css',
  'styles/planner.css',
  'styles/progress.css',
  'styles/modals.css',
  'styles/charts.css',
  'styles/recipes.css',
  'styles/trainer.css',
  'styles/debriefing.css',
  'styles/goals.css',
  'styles/library.css',
  'templates/planner.html',
  'templates/progress.html',
  'templates/profile.html',
  'templates/charts.html',
  'templates/recipes.html',
  'templates/modals.html',
  'templates/trainer.html',
  'templates/debriefing.html',
  'templates/goals.html',
  'templates/library.html',
  'src/main.js',
  'src/api/configService.js',
  'src/config/forms.js',
  'src/config/uiText.js',
  'src/core/state.js',
  'src/core/calculations.js',
  'src/core/validation.js',
  'src/core/trainer.js',
  'src/core/trainer/state.js',
  'src/core/trainer/queueBuilder.js',
  'src/core/trainer/machine.js',
  'src/core/trainer/animation.js',
  'src/ui/interactions/globalInteractions.js',
  'src/ui/interactions/plannerInteractions.js',
  'src/ui/interactions/profileInteractions.js',
  'src/ui/interactions/progressInteractions.js',
  'src/ui/interactions/debriefingInteractions.js',
  'src/ui/interactions/goalsInteractions.js',
  'src/ui/interactions/libraryInteractions.js',
  'src/ui/notifications.js',
  'src/ui/renderer.js',
  'src/ui/modals.js',
  'src/ui/modals/confirmModal.js',
  'src/ui/modals/dayEditorModal.js',
  'src/ui/modals/exerciseEditorModal.js',
  'src/ui/modals/recipeModal.js',
  'src/ui/modals/selectionModal.js',
  'src/ui/modals/workoutEditorModal.js',
  'src/ui/modals/ingredientEditorModal.js',
  'src/ui/modals/mealEditorModal.js',
  'src/ui/plannerRenderer.js',
  'src/ui/pageRenderers.js',
  'src/ui/charts.js',
  'src/ui/viewLoader.js',
  'src/ui/icons.js',
  'src/ui/trainerRenderer.js',
  'src/ui/components/TrainerComponent.js',
  'src/utils/constants.js',
  'src/utils/formatters.js',
  'src/utils/logger.js',
  'src/utils/audioFeedback.js',
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
