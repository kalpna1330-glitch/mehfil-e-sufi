const CACHE_NAME = "mehfil-e-sufi-offline-v6";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/logo.png",
  "/logo-mark.png",
  "/favicon.svg",
];

// Install Event: Pre-cache core app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting()),
  );
});

// Activate Event: Clean up old caches and take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      );
    }).then(() => self.clients.claim()),
  );
});

// Fetch Event: 100% Offline Cache-First Strategy
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // For SPA Navigation (opening the app or refreshing offline)
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then((cachedIndex) => {
        if (cachedIndex) return cachedIndex;
        return fetch(event.request).catch(() => caches.match("/"));
      }),
    );
    return;
  }

  // Cache-First for all assets (scripts, styles, icons)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return instantly from local cache (zero network required)
        return cachedResponse;
      }

      // If not in cache, fetch and store in cache for future offline use
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === "image") {
            return caches.match("/logo.png");
          }
        });
    }),
  );
});
