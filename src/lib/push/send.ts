import "server-only";
import webpush from "web-push";
import { getPushSubscriptions, deletePushSubscription } from "@/lib/db/push";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/db/orders";

let vapidReady: boolean | null = null;

/** Configura web-push con las llaves VAPID (perezoso; una sola vez). */
function ensureVapid(): boolean {
  if (vapidReady !== null) return vapidReady;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:aruviastore@gmail.com";
  if (!pub || !priv) {
    vapidReady = false;
    return false;
  }
  webpush.setVapidDetails(subject, pub, priv);
  vapidReady = true;
  return true;
}

/** ¿Está configurado el envío de notificaciones push? */
export function isPushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

/**
 * Envía una notificación push con el resumen del pedido a TODOS los dispositivos
 * admin suscritos. Best-effort: nunca lanza; limpia suscripciones muertas.
 */
export async function sendOrderPushToAdmins(order: Order): Promise<void> {
  if (!ensureVapid()) return;
  const subs = await getPushSubscriptions();
  if (!subs.length) return;

  const unidades = (order.order_items ?? []).reduce((n, it) => n + it.cantidad, 0);
  const canal = order.channel === "pos" ? "POS" : "Online";
  const cliente = order.cliente_nombre ? ` · ${order.cliente_nombre}` : "";
  const payload = JSON.stringify({
    title: `🛍️ Nuevo pedido ${order.id} · ${formatPrice(order.total)}`,
    body: `${canal} · ${unidades} artículo(s)${cliente}`,
    url: `/admin/pedidos/${order.id}`,
    tag: `order-${order.id}`,
  });

  await Promise.allSettled(
    subs.map((s) =>
      webpush
        .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
        .catch(async (err: unknown) => {
          // 404/410 = suscripción caducada o revocada -> eliminarla.
          const code = (err as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) await deletePushSubscription(s.endpoint);
        })
    )
  );
}
