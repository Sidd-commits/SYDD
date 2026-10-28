// SYDD Service Worker — Offline Shell & Asset Cache
// Preserves local-first state, guarantees real-time fitness data integrity

const CACHE_NAME = "sydd-v1";
const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

// Install: Pre-cache core app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Pre-cache should not fail installation if an optional icon is unavailable
        console.warn("[SYDD SW] Precache partial warning:", err);
        return self.skipWaiting();
      })
  );
});

// Activate: Clean up old cache generations and take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("sydd-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch routing
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignore non-http(s) schemes (e.g. chrome-extension://)
  if (!url.protocol.startsWith("http")) return;

  // Never cache API or sync routes to ensure fitness data integrity
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/sync")) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-first with offline shell fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallbackShell = await caches.match("/");
          if (fallbackShell) return fallbackShell;
          return new Response(
            `<!DOCTYPE html>
            <html lang="en" class="dark">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>SYDD — Offline</title>
              <style>
                body { background: #08090d; color: #f4f4f5; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 1.5rem; }
                h1 { color: #34d399; font-size: 1.5rem; margin-bottom: 0.5rem; }
                p { color: #a1a1aa; font-size: 0.9rem; max-width: 400px; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div>
                <h1>SYDD is Offline</h1>
                <p>Connect to the internet to load newly published updates. Your existing local logs remain safe on this device.</p>
              </div>
            </body>
            </html>`,
            {
              headers: { "Content-Type": "text/html" },
              status: 200,
            }
          );
        })
    );
    return;
  }

  // 2. Static Next.js assets & icons: Cache-first with network fallback
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});

// Skip waiting message listener
self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

