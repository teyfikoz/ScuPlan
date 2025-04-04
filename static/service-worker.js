/**
 * ScuPlan - Service Worker
 * Enables offline functionality and provides PWA support
 */

// Cache names
const CACHE_NAME = 'scuplan-cache-v1';
const DATA_CACHE_NAME = 'scuplan-data-cache-v1';

// Files to cache for offline use
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/checklist',
    '/technical',
    '/share',
    '/static/css/style.css',
    '/static/js/main.js',
    '/static/js/dive.js',
    '/static/js/tank.js',
    '/static/js/buddy.js',
    '/static/js/technical.js',
    '/static/js/checklist.js',
    '/static/js/storage.js',
    '/static/js/chart.js',
    '/static/js/donations.js',
    '/static/js/i18n.js',
    '/static/js/social_sharing.js',
    '/static/js/ar_preview.js',
    '/static/js/pwa.js',
    // Add all other important assets here
];

// Install event - caches static assets
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] Skip waiting on install');
                return self.skipWaiting();
            })
    );
});

// Activate event - cleans up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate');
    
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
        .then(() => {
            console.log('[ServiceWorker] Claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch event - serves responses from cache or network
self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] Fetch', event.request.url);
    
    // Handle API requests separately (for data caching)
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            // If the response was good, clone it and store it in the cache
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err => {
                            // Network request failed, try to get it from the cache
                            return cache.match(event.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }
    
    // For non-API requests, serve from cache if available, otherwise fetch
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(error => {
                console.log('[ServiceWorker] Fetch error:', error);
                
                // If the request is for an HTML page, return the offline page
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                
                // Otherwise just fail gracefully
                return new Response('Not available offline');
            })
    );
});

// Sync event - for background sync when coming back online
self.addEventListener('sync', event => {
    console.log('[ServiceWorker] Sync event:', event.tag);
    
    if (event.tag === 'sync-dive-plans') {
        event.waitUntil(syncDivePlans());
    } else if (event.tag === 'sync-checklists') {
        event.waitUntil(syncChecklists());
    }
});

// Push event - for handling push notifications
self.addEventListener('push', event => {
    console.log('[ServiceWorker] Push received:', event);
    
    let title = 'ScuPlan';
    let options = {
        body: 'Something new for your diving experience!',
        icon: '/static/images/icon-192x192.png',
        badge: '/static/images/badge-72x72.png'
    };
    
    // If we have message data, use it
    if (event.data) {
        const data = event.data.json();
        title = data.title || title;
        options.body = data.body || options.body;
        options.icon = data.icon || options.icon;
        options.badge = data.badge || options.badge;
        options.data = data.data || {};
    }
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event - handle notification interactions
self.addEventListener('notificationclick', event => {
    console.log('[ServiceWorker] Notification click:', event.notification.tag);
    
    event.notification.close();
    
    // Open a specific page based on the notification data
    let url = '/';
    if (event.notification.data && event.notification.data.url) {
        url = event.notification.data.url;
    }
    
    event.waitUntil(
        clients.matchAll({
            type: 'window'
        })
        .then(windowClients => {
            // If there's an open window, focus it
            for (let client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

/**
 * Sync dive plans that were created or updated offline
 */
async function syncDivePlans() {
    // This would need to access IndexedDB to get queued plans
    // For simplicity, we're not implementing the full logic here
    console.log('[ServiceWorker] Syncing dive plans');
    
    // This would normally involve:
    // 1. Getting queued plans from IndexedDB
    // 2. Sending them to the server
    // 3. Updating IndexedDB with the server response
}

/**
 * Sync checklists that were created or updated offline
 */
async function syncChecklists() {
    // Similar to syncDivePlans
    console.log('[ServiceWorker] Syncing checklists');
}
