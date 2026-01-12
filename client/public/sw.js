// Tree-Lance Service Worker for Push Notifications
const CACHE_NAME = 'treelance-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Tree-Lance Service Worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Tree-Lance Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: '🚨 Tree-Lance Alert',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    url: 'https://tr33lance.pro'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.notification?.title || payload.title || data.title,
        body: payload.notification?.body || payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        url: payload.data?.url || payload.click_action || data.url,
        data: payload.data || {}
      };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200, 100, 200],
    tag: 'treelance-alert',
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: data.url,
      ...data.data
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const url = event.notification.data?.url || 'https://tr33lance.pro';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('tr33lance') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed');
});
