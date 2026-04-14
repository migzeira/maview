const CACHE_NAME = "maview-v3";
const STATIC_CACHE = "maview-static-v3";

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon.svg",
];

// Install — cache static assets + offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  const keepCaches = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keepCaches.includes(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — strategy per resource type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API/external requests
  if (request.method !== "GET") return;
  if (url.hostname.includes("supabase.co")) return;
  if (url.hostname.includes("api.openai.com")) return;
  if (url.hostname.includes("connect.facebook.net")) return;
  if (url.hostname.includes("googletagmanager.com")) return;
  if (url.hostname.includes("mercadopago.com")) return;

  // JS/CSS chunks: cache-first (hashed filenames = immutable)
  if (url.pathname.match(/\/assets\/.*\.(js|css)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => caches.match("/offline.html"));
      })
    );
    return;
  }

  // Images: cache-first with fallback
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response("", { status: 404 }));
      })
    );
    return;
  }

  // Fonts: cache-first (long-lived)
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response("", { status: 404 }));
      })
    );
    return;
  }

  // HTML navigation: network-first, fall back to cache, then offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) =>
            cached || caches.match("/offline.html")
          )
        )
    );
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background sync for analytics events (when coming back online)
self.addEventListener("sync", (event) => {
  if (event.tag === "maview-sync") {
    event.waitUntil(
      // Flush any pending analytics from localStorage via client message
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "SYNC_FLUSH" }));
      })
    );
  }
});
