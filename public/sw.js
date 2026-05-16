const CACHE_NAME = "edunest-v1"
const STATIC_ASSETS = ["/", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"]

// Install event — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate event — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch event — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and API requests
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) return

  // Navigation: network first, fallback to cached home
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    )
    return
  }

  // Static assets: cache first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return res
        })
      )
    )
    return
  }

  // Network first for everything else
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? "EduNest", {
      body: data.message ?? "У вас нове сповіщення",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: { url: data.link ?? "/" },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url ?? "/"))
})
