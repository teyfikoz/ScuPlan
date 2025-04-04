// Service Worker for ScuPlan PWA
const CACHE_NAME = 'scuplan-cache-v1';

// Resources to cache initially
const INITIAL_RESOURCES = [
    '/',
    '/static/css/style.css',
    '/static/js/main.js',
    '/static/js/dive.js',
    '/static/js/tank.js',
    '/static/js/buddy.js',
    '/static/js/chart.js',
    '/static/js/checklist.js',
    '/static/js/sharing.js',
    '/static/js/storage.js',
    '/static/js/donations.js',
    '/static/js/i18n.js',
    '/static/js/social_sharing.js',
    '/static/js/ar_preview.js',
    '/static/js/pwa.js',
    '/static/images/icon-192x192.png',
    '/static/images/icon-512x512.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
];

// Install event - cache initial resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(INITIAL_RESOURCES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cache => {
                        if (cache !== CACHE_NAME) {
                            console.log('Service Worker: Clearing old cache', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin) &&
        !event.request.url.startsWith('https://cdn.jsdelivr.net') &&
        !event.request.url.startsWith('https://cdnjs.cloudflare.com') &&
        !event.request.url.startsWith('https://fonts.googleapis.com')) {
        return;
    }
    
    // For API calls, try network first, then fall back to cache
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('/calculate_') ||
        event.request.method !== 'GET') {
        
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone the response for caching
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // Only cache successful responses
                            if (response.status === 200) {
                                cache.put(event.request, responseClone);
                            }
                        });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } 
    // For normal navigation and resources, try cache first, then network
    else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Return cached response or fetch from network
                    return response || fetch(event.request)
                        .then(fetchResponse => {
                            // Clone the response for caching
                            const responseClone = fetchResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    // Only cache successful responses
                                    if (fetchResponse.status === 200) {
                                        cache.put(event.request, responseClone);
                                    }
                                });
                            return fetchResponse;
                        });
                })
                .catch(error => {
                    // If both cache and network fail, return a fallback
                    console.error('Service Worker fetch error:', error);
                    
                    // If it's an HTML request, show an offline page
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/static/offline.html');
                    }
                    
                    // For other resources, return a simple error
                    return new Response('Network error occurred', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                })
        );
    }
});

// Handle background sync for offline data
self.addEventListener('sync', event => {
    if (event.tag === 'sync-dive-plans') {
        event.waitUntil(syncDivePlans());
    } else if (event.tag === 'sync-checklists') {
        event.waitUntil(syncChecklists());
    }
});

/**
 * Sync dive plans that were created or updated offline
 */
async function syncDivePlans() {
    try {
        // Get the list of dive plans to sync from IndexedDB
        const plansToSync = await getPlansToSync();
        
        // Loop through plans and sync each one
        for (const plan of plansToSync) {
            await syncPlanToServer(plan);
        }
        
        // Send notification on successful sync
        self.registration.showNotification('ScuPlan', {
            body: `${plansToSync.length} dive plans synced successfully`,
            icon: '/static/images/icon-192x192.png'
        });
    } catch (error) {
        console.error('Background sync for dive plans failed:', error);
    }
}

/**
 * Sync checklists that were created or updated offline
 */
async function syncChecklists() {
    try {
        // Get the list of checklists to sync from IndexedDB
        const checklistsToSync = await getChecklistsToSync();
        
        // Loop through checklists and sync each one
        for (const checklist of checklistsToSync) {
            await syncChecklistToServer(checklist);
        }
        
        // Send notification on successful sync
        self.registration.showNotification('ScuPlan', {
            body: `${checklistsToSync.length} checklists synced successfully`,
            icon: '/static/images/icon-192x192.png'
        });
    } catch (error) {
        console.error('Background sync for checklists failed:', error);
    }
}

// Placeholder functions - would be implemented with IndexedDB in a full app
async function getPlansToSync() {
    // Would fetch from IndexedDB
    return [];
}

async function syncPlanToServer(plan) {
    // Would send to server
}

async function getChecklistsToSync() {
    // Would fetch from IndexedDB
    return [];
}

async function syncChecklistToServer(checklist) {
    // Would send to server
}
