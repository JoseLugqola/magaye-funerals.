const CACHE_NAME = 'magaye-v1';
const ASSETS = [
  '/',
  '/guest.html',
  '/customer_registration.html',
  '/customer_login.html',
  '/customer_dashboard.html',
  '/staff_login.html',
  '/index.html',
  '/directory.html',
  '/member_details.html',
  '/active_policy.html',
  '/full_policy.html',
  '/style.css',
  '/script.js',
  '/logo.png',
  '/manifest.json',
  '/terms.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
