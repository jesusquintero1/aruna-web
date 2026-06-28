import { NextRequest, NextResponse } from "next/server";
import { getPayment, verifyWebhookSignature } from "@/lib/payments/mercadopago";
import { markOrderPaid, releaseOrder } from "@/lib/db/orders";
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
    if (!payment?.external_reference) {
      return NextResponse.json({ received: true });
    }

    const orderId = payment.external_reference;
    if (payment.status === "approved") {
      await markOrderPaid(orderId, payment.id);
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await releaseOrder(orderId);
    }
    // pending / in_process: se deja el pedido como 'pendiente'.

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Error webhook Mercado Pago:", e);
    // Respondemos 200 para que MP no reintente en bucle por un error nuestro transitorio.
    return NextResponse.json({ received: true });
  }
}

// Mercado Pago a veces hace un GET de verificación.
export async function GET() {
  return NextResponse.json({ ok: true });
}
