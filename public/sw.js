
// // public/sw.js
// const CACHE_NAME = "hop-church-v2";

// const PRECACHE_ASSETS = [
//     "/",
//     "/verify",
//     "/offline",
//     "/icons/icon-192x192.png",
//     "/icons/icon-512x512.png",
// ];

// // Image extensions to cache automatically
// const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|ico|avif)$/i;

// self.addEventListener("install", (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => {
//             return cache.addAll(PRECACHE_ASSETS);
//         })
//     );
//     self.skipWaiting();
// });

// self.addEventListener("activate", (event) => {
//     event.waitUntil(
//         caches.keys().then((cacheNames) => {
//             return Promise.all(
//                 cacheNames
//                     .filter((name) => name !== CACHE_NAME)
//                     .map((name) => caches.delete(name))
//             );
//         })
//     );
//     self.clients.claim();
// });

// self.addEventListener("fetch", (event) => {
//     const { request } = event;
//     const url = new URL(request.url);

//     if (request.method !== "GET") return;

//     // Skip API routes, auth, and Supabase calls
//     if (
//         url.pathname.startsWith("/api") ||
//         url.pathname.startsWith("/auth") ||
//         url.hostname.includes("supabase")
//     ) {
//         return;
//     }

//     // ── Images: cache-first (includes hero images) ──
//     if (IMAGE_EXTENSIONS.test(url.pathname) || url.pathname.includes("/_next/image")) {
//         event.respondWith(
//             caches.match(request).then((cached) => {
//                 if (cached) return cached;
//                 return fetch(request).then((response) => {
//                     if (response.ok) {
//                         const clone = response.clone();
//                         caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
//                     }
//                     return response;
//                 }).catch(() => {
//                     // Return nothing for failed image loads
//                     return new Response("", { status: 404 });
//                 });
//             })
//         );
//         return;
//     }

//     // ── Static assets (JS, CSS, fonts): cache-first ──
//     if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) || url.pathname.startsWith("/_next/static")) {
//         event.respondWith(
//             caches.match(request).then((cached) => {
//                 if (cached) return cached;
//                 return fetch(request).then((response) => {
//                     if (response.ok) {
//                         const clone = response.clone();
//                         caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
//                     }
//                     return response;
//                 });
//             })
//         );
//         return;
//     }

//     // ── Supabase storage images (avatars, uploaded images) ──
//     if (url.hostname.includes("supabase") && IMAGE_EXTENSIONS.test(url.pathname)) {
//         event.respondWith(
//             caches.match(request).then((cached) => {
//                 if (cached) return cached;
//                 return fetch(request).then((response) => {
//                     if (response.ok) {
//                         const clone = response.clone();
//                         caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
//                     }
//                     return response;
//                 });
//             })
//         );
//         return;
//     }

//     // ── Pages: network-first with offline fallback ──
//     event.respondWith(
//         fetch(request)
//             .then((response) => {
//                 if (response.ok) {
//                     const clone = response.clone();
//                     caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
//                 }
//                 return response;
//             })
//             .catch(() => {
//                 return caches.match(request).then((cached) => {
//                     return cached || caches.match("/offline");
//                 });
//             })
//     );
// });

// // ── Push notification handler ──
// self.addEventListener("push", (event) => {
//     if (!event.data) return;

//     const data = event.data.json();

//     const options = {
//         body: data.body || "You have a new notification",
//         icon: "/icons/icon-192x192.png",
//         badge: "/icons/icon-96x96.png",
//         vibrate: [100, 50, 100],
//         data: {
//             url: data.url || "/",
//         },
//         actions: data.actions || [],
//     };

//     event.waitUntil(
//         self.registration.showNotification(data.title || "HOP Church", options)
//     );
// });

// // ── Notification click handler ──
// self.addEventListener("notificationclick", (event) => {
//     event.notification.close();

//     const url = event.notification.data?.url || "/";

//     event.waitUntil(
//         self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
//             // Focus existing window if open
//             for (const client of clients) {
//                 if (client.url.includes(self.location.origin) && "focus" in client) {
//                     client.navigate(url);
//                     return client.focus();
//                 }
//             }
//             // Open new window
//             return self.clients.openWindow(url);
//         })
//     );
// });

// public/sw.js - Service Worker for offline support

const CACHE_NAME = 'hop-v1';
const DYNAMIC_CACHE_NAME = 'hop-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    '/logo.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Skip API requests for offline queue
    if (request.url.includes('/api/')) {
        // Handle API requests with offline queue
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Skip Supabase requests
    if (request.url.includes('supabase.co')) {
        event.respondWith(fetch(request));
        return;
    }

    // Stale-while-revalidate strategy for most requests
    event.respondWith(
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            return fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response.status === 200) {
                        cache.put(request, response.clone());
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return cache.match(request);
                });
        })
    );
});

// Handle API requests with offline queue
async function handleAPIRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);
        return response;
    } catch (error) {
        // If offline, return offline response
        return new Response(
            JSON.stringify({
                offline: true,
                message: 'You are offline. Your changes will be synced when you reconnect.',
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}

// Background sync for offline queue
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-queue') {
        event.waitUntil(syncQueue());
    }
});

async function syncQueue() {
    try {
        const response = await fetch('/api/sync', { method: 'POST' });
        const result = await response.json();
        console.log('[SW] Sync completed:', result);
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}