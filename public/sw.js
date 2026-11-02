const CACHE_NAME = "pangandaranhub-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.webmanifest",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
  "/logo.PNG",
  "/favicon.ico",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[SW] Cache addAll warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network-first with cache fallback for HTML, Cache-first for images/icons)
self.addEventListener("fetch", (event) => {
  // Hanya proses GET request dan abaikan request non-HTTP/Firebase/Chrome-Extension
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Jangan cache request ke Google/Firebase API
  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("firestore")
  ) {
    return;
  }

  // Tangani request static & navigasi
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan copy response valid ke cache jika request berasal dari domain sendiri
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Jika navigasi halaman offline dan tidak ada cache, return fallback jika ada
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
      })
  );
});

