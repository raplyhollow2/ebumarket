/* Zyra PWA service worker */
const CACHE = "zyra-v3";
const PRECACHE = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/maskable-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Precache each asset individually so one failure doesn't kill install
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[zyra-sw] precache skip", url, err);
          }),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// Required for installability — handle same-origin GETs
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Bypass API / dynamic backends
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("checkout") ||
    url.pathname.startsWith("/auth")
  ) {
    return;
  }

  // Navigations: network first
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, res.clone());
          return res;
        } catch {
          return (
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            new Response("Zyra is offline. Reconnect to continue.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }
      })(),
    );
    return;
  }

  // Static / icons / images: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/bhutan/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/sw.js" ||
    /\.(webp|png|jpg|jpeg|svg|woff2?|js|css)$/i.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request);
        if (cached) {
          fetch(request)
            .then((res) => {
              if (res.ok) cache.put(request, res.clone());
            })
            .catch(() => {});
          return cached;
        }
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          return new Response("", { status: 504 });
        }
      })(),
    );
  }
});
