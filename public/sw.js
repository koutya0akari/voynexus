const CACHE_NAME = "voynexus-pwa-v2";
const OFFLINE_PAGE = "/";
const OFFLINE_ASSETS = [OFFLINE_PAGE, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(handleFetch(event));
});

async function handleFetch(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  const sameOrigin = new URL(request.url).origin === self.location.origin;

  const networkPromise = (async () => {
    try {
      const response = await fetch(request);
      if (response.ok && sameOrigin) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return null;
    }
  })();

  if (cachedResponse) {
    event.waitUntil(networkPromise);
    return cachedResponse;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  if (request.mode === "navigate") {
    const offlineFallback = await cache.match(OFFLINE_PAGE);
    if (offlineFallback) {
      return offlineFallback;
    }
  }

  return Response.error();
}
