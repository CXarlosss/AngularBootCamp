importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// REPLACE THESE PLACEHOLDERS WITH REAL VALUES FROM FIREBASE CONSOLE
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  projectId: 'fitcoach-xxx',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'FitCoach';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: payload.data?.deepLink || 'default',
    data: payload.data || {},
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Ver ahora' }
    ]
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const deepLink = event.notification.data?.deepLink || '/client/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(deepLink) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(deepLink);
    })
  );
});
