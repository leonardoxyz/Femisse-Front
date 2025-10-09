// Service Worker para PWA
// Versão: 1.0.1

const CACHE_VERSION = 'v2';
const CACHE_NAME = `feminisse-${CACHE_VERSION}`;
const RUNTIME_CACHE = `feminisse-runtime-${CACHE_VERSION}`;

// Assets para cache inicial
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;

  // Ignora requisições de API (sempre busca da rede)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clona a resposta
        const responseClone = response.clone();

        // Salva no cache runtime
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Se falhar, tenta buscar do cache
        return caches.match(event.request);
      })
  );
});
