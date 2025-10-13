// ScuPlan Service Worker - Offline-First PWA
const CACHE_NAME = 'scuplan-v1.0.0';
const RUNTIME_CACHE = 'scuplan-runtime';

// Files to cache immediately
const PRECACHE_URLS = [
  '/spa.html',
  '/manifest.json',
  '/',
  // External CDN resources will be cached on first use
];

// Install event - precache critical files
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map(cacheName => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests for external CDNs initially
  if (url.origin !== self.location.origin) {
    // Cache external resources after first fetch (runtime caching)
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            return response;
          }
          
          return fetch(request).then(networkResponse => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return offline fallback for failed fetches
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
        });
      })
    );
    return;
  }
  
  // For same-origin requests, use cache-first strategy
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        // Return cached response
        return response;
      }
      
      // Clone the request
      const fetchRequest = request.clone();
      
      return fetch(fetchRequest).then(networkResponse => {
        // Check if valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Clone the response
        const responseToCache = networkResponse.clone();
        
        // Cache the fetched response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Network failed, return offline page
        if (request.destination === 'document') {
          return caches.match('/spa.html');
        }
        
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// Background sync for saving dive plans when online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-dive-plans') {
    event.waitUntil(syncDivePlans());
  }
});

async function syncDivePlans() {
  // Implement background sync logic here
  console.log('[Service Worker] Syncing dive plans...');
  // This would sync locally saved plans to a server when connection is restored
}

// Push notification support (for future features)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New dive plan update',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'scuplan-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification('ScuPlan', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/spa.html')
  );
});

// Message handler for manual cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        return self.clients.claim();
      })
    );
  }
});

console.log('[Service Worker] Loaded successfully');