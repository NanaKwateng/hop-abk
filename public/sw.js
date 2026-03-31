// public/sw.js
const CACHE_NAME = "hop-church-v1";

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
    "/",
    "/verify",

    "/offline",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// Install: pre-cache critical assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
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

// Fetch: network-first for pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip API routes and auth
    if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) {
        return;
    }

    // Static assets: cache-first
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|ico)$/)
    ) {
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

    // Pages: network-first with offline fallback
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