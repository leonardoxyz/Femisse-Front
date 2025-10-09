// Service Worker para PWA
// Versão: 1.0.3 (corrigida)

const CACHE_VERSION = 'v3';
const CACHE_NAME = `feminisse-${CACHE_VERSION}`;
const RUNTIME_CACHE = `feminisse-runtime-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ignora requisições não-GET
  if (req.method !== 'GET') return;

  // Ignora APIs, autenticação e manifest
  if (
    req.url.includes('/api/') ||
    req.url.includes('/auth/') ||
    req.url.includes('manifest.json') ||
    req.url.startsWith('chrome-extension://')
  ) {
    return;
  }

  // Ignora qualquer protocolo não-HTTP
  if (!req.url.startsWith('http')) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Só cacheia respostas válidas e completas
        if (res.status === 200 && res.type === 'basic') {
          const cloned = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, cloned));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
