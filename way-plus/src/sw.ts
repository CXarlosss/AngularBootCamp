/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST || []);

// Runtime caching logic
registerRoute(
  /\/assets\/(pdf|PatientAnalyticsView|EvolutionCharts|framer|supabase)-.*\.js$/,
  new StaleWhileRevalidate({
    cacheName: 'lazy-chunks',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  /\.(?:png|jpg|jpeg|webp|svg)$/,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 2592000 // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// ─── PUSH NOTIFICATIONS ───
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-96.png',
      tag: data.tag || 'way-notification',
      requireInteraction: data.requireInteraction ?? false,
      actions: data.actions || [],
      data: data.data || {},
    })
  );
});

// ─── CLICK EN NOTIFICACIÓN ───
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  let url = '/';
  
  if (action === 'play' || data.type === 'streak_at_risk' || data.type === 'reminder') {
    url = '/map';
  } else if (action === 'claim' || data.type === 'reward_ready') {
    url = '/daily-chest';
  } else if (action === 'view' || data.type === 'therapist_message') {
    url = '/messages';
  } else if (data.type === 'new_level') {
    url = `/step/${data.levelId || '1'}`;
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si hay una ventana abierta, enfocarla y navegar
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', action, url, data });
          return;
        }
      }
      // Si no, abrir nueva
      self.clients.openWindow(url);
    })
  );
});

// ─── MENSAJES DESDE LA APP (foreground) ───
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const payload = event.data.payload;
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
      renotify: payload.renotify,
      requireInteraction: payload.requireInteraction,
      actions: payload.actions,
      data: payload.data,
    });
  }
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
