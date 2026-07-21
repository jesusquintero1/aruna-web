import "server-only";
import { sendPaidOrderEmails } from "@/lib/email/send";
import { sendOrderPushToAdmins } from "@/lib/push/send";
import type { Order } from "@/lib/db/orders";

/**
 * Notifica un pedido confirmado por TODOS los canales configurados:
 *   - correo (confirmación al cliente si hay email + alerta de venta al admin),
 *   - notificación push a los dispositivos admin suscritos.
 * Best-effort: cada canal es no-op si no está configurado y nunca lanza, de modo
 * que un fallo de notificación jamás rompe el flujo de pedido/pago.
 */
export async function notifyOrderConfirmed(order: Order, fallbackEmail?: string | null): Promise<void> {
  await Promise.allSettled([
    sendPaidOrderEmails(order, fallbackEmail),
    sendOrderPushToAdmins(order),
  ]);
}
