/*
 * Service worker mínimo de ARÜVIA.
 *
 * Su único objetivo es habilitar la INSTALACIÓN de la PWA (Android/Chrome exige
 * un service worker con manejador de fetch para ofrecer el prompt de instalación).
 * NO cachea respuestas: la tienda y el POS dependen de datos en vivo (Supabase),
 * y servir contenido cacheado podría mostrar inventario/pedidos obsoletos.
 * Por eso el fetch es passthrough (deja que el navegador vaya siempre a la red).
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passthrough intencional: sin caché. La presencia de este manejador es lo
  // que habilita la instalación; no interceptamos la respuesta.
});
