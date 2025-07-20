importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// La configuración de Firebase se cargará dinámicamente
// Firebase se inicializará desde la aplicación principal

// Cache configuration
const CACHE_NAME = 'energy-club-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/img/ModernIcon.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Push event - handle incoming notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.notification.body,
      icon: '/img/ModernIcon.svg',
      badge: '/img/ModernIcon.svg',
      vibrate: [200, 100, 200],
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(data.notification.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
