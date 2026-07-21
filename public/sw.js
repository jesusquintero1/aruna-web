/*
 * Service worker de ARÜVIA.
 *
 * 1) Habilita la INSTALACIÓN de la PWA (Android/Chrome exige un SW con
 *    manejador de fetch para ofrecer el prompt de instalación). El fetch es
 *    passthrough (sin caché): la tienda y el POS dependen de datos en vivo
 *    (Supabase) y servir contenido cacheado mostraría inventario/pedidos viejos.
 * 2) Recibe NOTIFICACIONES PUSH de nuevos pedidos y las muestra.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passthrough intencional: sin caché. La presencia de este manejador habilita
  // la instalación; no interceptamos la respuesta.
});

// --- Notificaciones push (nuevos pedidos) ---
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "ARÜVIA";
  const options = {
    body: data.body || "Nuevo pedido recibido",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "aruvia-order",
    data: { url: data.url || "/admin/pedidos" },
    vibrate: [120, 60, 120],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocar la notificación: enfocar la app (o abrirla) en el pedido.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin/pedidos";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ("focus" in client) {
          if ("navigate" in client) client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
