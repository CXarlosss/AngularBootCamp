const CACHE_NAME = 'way-plus-v2';
const STATIC_CACHE = 'way-static-v2';
const IMAGE_CACHE = 'way-images-v2';
const API_CACHE = 'way-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
];

// Instalación: cachear shell inmediatamente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => console.warn('Error cacheando assets estáticos:', err));
    })
  );
  self.skipWaiting();
});

// Activación: limpiar caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.includes('v2'))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: estrategia inteligente por tipo de request
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. API de Supabase: Network first, fallback a cache
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 2. Imágenes: Cache first, network fallback + revalidación
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          // Revalidar en background
          fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
          }).catch(() => {});
          return cached;
        }
        
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // 3. Fuentes y scripts: Cache first
  if (request.destination === 'font' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // 4. Navegación: Network first (para actualizaciones), fallback a shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Background Sync para operaciones pendientes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-way-data') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'TRIGGER_SYNC' }));
      })
    );
  }
});
