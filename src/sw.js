const CACHE_VERSION = "v2-0-4"
const CACHE_NAME = `finance-tracker-${CACHE_VERSION}`;
const RUNTIME_CACHE = `app-runtime-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/site.webmanifest',
];
// Images and fonts use cache-first
const CACHE_FIRST_ROUTES = [
    /\.js$/,
    /\.css$/,
    /\.(woff|woff2|ttf)$/,
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/,
];
// HTML pages use stale-while-revalidate
const STALE_WHILE_REVALIDATE_ROUTES = [
    /\.html$/,
];

function isStaleWhileRevalidate(url) {
    return STALE_WHILE_REVALIDATE_ROUTES.some((pattern) => {
        if (typeof pattern === 'string') {
            return url.pathname.startsWith(pattern);
        }
        return pattern.test(url.pathname);
    });
}

function isCacheFirst(url) {
    return CACHE_FIRST_ROUTES.some((pattern) => {
        if (typeof pattern === 'string') {
            return url.pathname.startsWith(pattern);
        }
        return pattern.test(url.pathname);
    });
}

/**
 * Stale-while-revalidate strategy: use cache immediately, update in background
 * Use for HTML pages and semi-static content
 */
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);

    if (cached) {
        // Return cached immediately, update in background
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const cache = caches.open(RUNTIME_CACHE);
                    cache.then((c) => c.put(request, response.clone()));
                }
            })
            .catch((error) => {
                console.log('[SW] Background fetch failed:', request.url);
                console.log(error)
            });

        return cached;
    }

    // No cache available, try to fetch
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[SW] Stale-while-revalidate failed:', request.url);
    }
}

/**
 * Cache-first strategy: use cache, fall back to network
 * Use for static assets (JS, CSS, fonts, images)
 */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());

            getCacheSizeStats().then(quota => {
                console.log(quota);
            })
        }
        return response;
    } catch (error) {
        console.log('[SW] Failed to fetch:', request.url);
    }
}

const getCacheSizeStats = async () => {
    let totalSize = 0;
    const cacheNames = await caches.keys();

    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }

    return `Cache size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`;
};

// Install event: cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
                console.warn('[SW] Some assets failed to cache during install:', error);
                // Continue despite partial failures
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    // Delete TRULY old cache versions
                    if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
                        if (!key.includes(CACHE_VERSION)) {
                            return caches.delete(key);
                        }
                    }
                })
            );
        })
    );
    self.clients.claim();
});

//  Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions and other non-http(s) protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Determine caching strategy based on URL
    if (isCacheFirst(url)) {
        event.respondWith(cacheFirst(request));
    } else if (isStaleWhileRevalidate(url)) {
        event.respondWith(staleWhileRevalidate(request));
    } else {
        event.respondWith(cacheFirst(request));
    }
});