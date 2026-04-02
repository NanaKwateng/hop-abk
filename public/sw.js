// // public/sw.js
// const CACHE_NAME = "hop-church-v1";

// // Assets to pre-cache on install
// const PRECACHE_ASSETS = [
//     "/",
//     "/verify",

//     "/offline",
//     "/icons/icon-192x192.png",
//     "/icons/icon-512x512.png",
// ];

// // Install: pre-cache critical assets
// self.addEventListener("install", (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => {
//             return cache.addAll(PRECACHE_ASSETS);
//         })
//     );
//     self.skipWaiting();
// });

// // Activate: clean up old caches
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

// // Fetch: network-first for pages, cache-first for static assets
// self.addEventListener("fetch", (event) => {
//     const { request } = event;
//     const url = new URL(request.url);

//     // Skip non-GET requests
//     if (request.method !== "GET") return;

//     // Skip API routes and auth
//     if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) {
//         return;
//     }

//     // Static assets: cache-first
//     if (
//         url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|ico)$/)
//     ) {
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

//     // Pages: network-first with offline fallback
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




// public/sw.js
const CACHE_NAME = "hop-church-v2";

const PRECACHE_ASSETS = [
    "/",
    "/verify",
    "/offline",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// Image extensions to cache automatically
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|ico|avif)$/i;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET") return;

    // Skip API routes, auth, and Supabase calls
    if (
        url.pathname.startsWith("/api") ||
        url.pathname.startsWith("/auth") ||
        url.hostname.includes("supabase")
    ) {
        return;
    }

    // ── Images: cache-first (includes hero images) ──
    if (IMAGE_EXTENSIONS.test(url.pathname) || url.pathname.includes("/_next/image")) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                }).catch(() => {
                    // Return nothing for failed image loads
                    return new Response("", { status: 404 });
                });
            })
        );
        return;
    }

    // ── Static assets (JS, CSS, fonts): cache-first ──
    if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) || url.pathname.startsWith("/_next/static")) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // ── Supabase storage images (avatars, uploaded images) ──
    if (url.hostname.includes("supabase") && IMAGE_EXTENSIONS.test(url.pathname)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // ── Pages: network-first with offline fallback ──
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(request).then((cached) => {
                    return cached || caches.match("/offline");
                });
            })
    );
});

// ── Push notification handler ──
self.addEventListener("push", (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body || "You have a new notification",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
        vibrate: [100, 50, 100],
        data: {
            url: data.url || "/",
        },
        actions: data.actions || [],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "HOP Church", options)
    );
});

// ── Notification click handler ──
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = event.notification.data?.url || "/";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            // Focus existing window if open
            for (const client of clients) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            // Open new window
            return self.clients.openWindow(url);
        })
    );
});