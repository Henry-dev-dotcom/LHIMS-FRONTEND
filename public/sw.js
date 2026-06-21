const CACHE_VERSION = 'diagnosis-center-phase9-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL_URLS = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('diagnosis-center-') && !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function canCacheResponse(response) {
  return response && response.ok && (response.type === 'basic' || response.type === 'default');
}

function networkFirstNavigation(request) {
  return fetch(request)
    .then((response) => {
      if (canCacheResponse(response)) {
        const copy = response.clone();
        caches.open(APP_SHELL_CACHE).then((cache) => cache.put('/index.html', copy));
      }
      return response;
    })
    .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/offline.html')));
}

function cacheFirstAsset(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (canCacheResponse(response)) {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    });
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.ico')) {
    event.respondWith(cacheFirstAsset(request));
  }
});
