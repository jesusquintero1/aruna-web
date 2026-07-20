import { NextRequest, NextResponse } from "next/server";
import { getPayment, verifyWebhookSignature } from "@/lib/payments/mercadopago";
import { markOrderPaid, releaseOrder, getOrderById } from "@/lib/db/orders";
import { sendPaidOrderEmails } from "@/lib/email/send";
import { revalidatePath } from "next/cache";

/**
 * Webhook de Mercado Pago. Recibe notificaciones de pago, valida la firma,
 * consulta el pago real en MP y actualiza el pedido:
 *   - approved  -> mark_order_paid (pendiente -> pagado)
 *   - rejected/cancelled -> release_order (repone stock, cancela)
 * Nunca confía en el cuerpo: siempre re-consulta el pago en MP por su id.
 */
export async function POST(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    // El id del pago puede venir por query (?data.id=) o en el cuerpo (data.id / id).
    const dataId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      (body as { data?: { id?: string | number } })?.data?.id?.toString() ||
      (body as { id?: string | number })?.id?.toString() ||
      null;

    const type =
      url.searchParams.get("type") ||
      url.searchParams.get("topic") ||
      (body as { type?: string })?.type ||
      "";

    // Validar firma (si hay secreto configurado).
    const ok = verifyWebhookSignature({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId,
    });
    if (!ok) {
      return NextResponse.json({ error: "firma inválida" }, { status: 401 });
    }

    // Solo nos interesan notificaciones de pago.
    if (!dataId || (type && !type.includes("payment"))) {
      return NextResponse.json({ received: true });
    }

    const payment = await getPayment(dataId);
    if (!payment) {
      // No pudimos consultar el pago (probable fallo transitorio de la API de MP).
      // Respondemos 5xx para que Mercado Pago REINTENTE en vez de perder la
      // confirmación (antes se respondía 200 y el pago se perdía para siempre).
      console.error("Webhook MP: getPayment devolvió null para data.id", dataId);
      return NextResponse.json({ error: "no se pudo consultar el pago" }, { status: 502 });
    }
    if (!payment.external_reference) {
      // Pago sin pedido asociado: nada que conciliar.
      return NextResponse.json({ received: true });
    }

    const orderId = payment.external_reference;
    if (payment.status === "approved") {
      // markOrderPaid LANZA si hay error de DB -> cae al catch -> 500 -> MP reintenta.
      const cambioApagado = await markOrderPaid(orderId, payment.id);
      if (cambioApagado) {
        // Enviar correos solo en la PRIMERA transición a pagado (evita duplicados en reintentos).
        const order = await getOrderById(orderId);
        if (order) await sendPaidOrderEmails(order, payment.payer_email);
      } else {
        // No transicionó: o ya estaba pagado (idempotente, correcto), o el pedido
        // ya no estaba 'pendiente'. Si está CANCELADO es una incongruencia grave
        // (el cliente pagó pero el cron ya canceló el pedido y liberó el stock):
        // lo dejamos muy visible en los logs para regularizarlo a mano.
        const order = await getOrderById(orderId);
        if (order && order.estado === "cancelado") {
          console.error(
            `⚠️ RECONCILIAR: pago ${payment.id} APROBADO para el pedido ${orderId} que está ` +
              `CANCELADO (stock liberado). El cliente fue cobrado; revisar y regularizar manualmente.`
          );
        }
      }
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await releaseOrder(orderId);
    }
    // pending / in_process: se deja el pedido como 'pendiente'.

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Error webhook Mercado Pago:", e);
    // Error posiblemente transitorio (DB/red): respondemos 5xx para que Mercado Pago
    // reintente y NO se pierda la confirmación del pago.
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}

// Mercado Pago a veces hace un GET de verificación.
export async function GET() {
  return NextResponse.json({ ok: true });
}
