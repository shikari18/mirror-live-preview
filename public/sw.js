// Service Worker for FishFarm OS Ghana PWA Push Notifications & Offline Caching
const CACHE_NAME = "fishfarm-os-v1";

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
  event.waitUntil(self.clients.claim());
});

// Handle Background Push Notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "FishFarm OS Alert 🐟";
  const options = {
    body: data.body || "Time to check your fish ponds and feeding schedule.",
    icon: "/pwa-192.png",
    badge: "/logo.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/home" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle Notification Clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || "/home");
      }
    })
  );
});
