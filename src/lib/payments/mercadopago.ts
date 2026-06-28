import "server-only";
import crypto from "crypto";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type { Order } from "@/lib/db/orders";

/** ¿Está configurado Mercado Pago? */
export function isMpConfigured(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

function getClient(): MercadoPagoConfig | null {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return null;
  return new MercadoPagoConfig({ accessToken });
}

export interface PreferenceResult {
  id: string;
  init_point: string;
}

/**
 * Crea una preferencia de Checkout Pro a partir de un pedido YA creado en la DB.
 * Los precios salen de los `order_items` (snapshots calculados en el servidor),
 * nunca del cliente. `external_reference` = id del pedido (para conciliar en el webhook).
 */
export async function createPreference(order: Order, baseUrl: string): Promise<PreferenceResult | null> {
  const client = getClient();
  if (!client) return null;

  const items = (order.order_items ?? []).map((it) => ({
    id: it.product_id ?? order.id,
    title: it.nombre_snapshot,
    quantity: it.cantidad,
    unit_price: it.precio_snapshot,
    currency_id: "COP",
  }));
  if (!items.length) return null;

  const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  const pref = new Preference(client);
  const result = await pref.create({
    body: {
      items,
      external_reference: order.id,
      payer: {
        name: order.cliente_nombre ?? undefined,
        email: order.cliente_email ?? undefined,
      },
      back_urls: {
        success: `${baseUrl}/checkout/resultado`,
        failure: `${baseUrl}/checkout/resultado`,
        pending: `${baseUrl}/checkout/resultado`,
      },
      auto_return: "approved",
      // Mercado Pago rechaza notification_url con localhost: se omite en local.
      ...(isLocal ? {} : { notification_url: `${baseUrl}/api/mercadopago/webhook` }),
      statement_descriptor: "ARUNA",
    },
  });

  const init_point = result.init_point;
  if (!result.id || !init_point) return null;
  return { id: String(result.id), init_point };
}

export interface PaymentInfo {
  id: string;
  status: string; // approved | rejected | pending | in_process | cancelled | refunded ...
  external_reference: string | null;
}

/** Consulta un pago por id (lo usa el webhook para conocer su estado real). */
export async function getPayment(paymentId: string): Promise<PaymentInfo | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const payment = new Payment(client);
    const p = await payment.get({ id: paymentId });
    return {
      id: String(p.id),
      status: String(p.status ?? "pending"),
      external_reference: p.external_reference ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Valida la firma del webhook (cabecera x-signature) según el esquema de Mercado Pago:
 *   manifest = `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 *   HMAC-SHA256(manifest, MP_WEBHOOK_SECRET) == v1
 * Si no hay secreto configurado, devuelve true (modo permisivo para pruebas).
 */
export function verifyWebhookSignature(opts: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secreto: no se valida (entorno de prueba)

  const { xSignature, xRequestId, dataId } = opts;
  if (!xSignature || !dataId) return false;

  // x-signature: "ts=<ts>,v1=<hash>"
  const parts = Object.fromEntries(
    xSignature.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId ?? ""};ts:${ts};`;
  const computed = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(v1));
  } catch {
    return false;
  }
}
