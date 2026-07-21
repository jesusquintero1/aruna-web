import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { Order } from "@/lib/db/orders";

/** ¿Está configurado el envío de correos? */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM || "ARÜVIA <onboarding@resend.dev>";
// Correo del negocio al que llega la alerta de venta. Con Resend SIN dominio
// verificado solo se puede enviar a la dirección DUEÑA de la cuenta Resend, así
// que la cuenta Resend debe crearse con este mismo correo.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "aruviastore@gmail.com";

function itemsTable(order: Order): string {
  const rows = (order.order_items ?? [])
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#2b2118;">${it.cantidad}× ${escapeHtml(it.nombre_snapshot)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#2b2118;font-weight:700;">${formatPrice(it.subtotal)}</td>
      </tr>`
    )
    .join("");
  const descuento =
    order.descuento > 0
      ? `<tr><td style="padding:6px 0;color:#0a7d4b;">Descuento</td><td style="padding:6px 0;text-align:right;color:#0a7d4b;">− ${formatPrice(order.descuento)}</td></tr>`
      : "";
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${rows}
      ${descuento}
      <tr>
        <td style="padding:12px 0 0;font-weight:800;color:#2b2118;">Total</td>
        <td style="padding:12px 0 0;text-align:right;font-weight:800;color:#c0392b;font-size:18px;">${formatPrice(order.total)}</td>
      </tr>
    </table>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
}

function shell(title: string, body: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f3ec;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e0d4;border-radius:16px;overflow:hidden;">
      <div style="background:#2b2118;padding:20px;text-align:center;">
        <span style="color:#d4af37;font-size:22px;font-weight:800;letter-spacing:2px;">✦ ARÜVIA ✦</span>
      </div>
      <div style="padding:28px;">
        <h1 style="font-size:20px;color:#2b2118;margin:0 0 12px;">${title}</h1>
        ${body}
      </div>
      <div style="background:#f7f3ec;padding:16px;text-align:center;color:#8a7d6a;font-size:12px;">
        ARÜVIA · Mochilas Wayuu de La Guajira · ${escapeHtml(siteConfig.url)}
      </div>
    </div>
  </div>`;
}

function clienteResumen(order: Order): string {
  const dir = [order.cliente_direccion, order.cliente_ciudad, order.cliente_departamento].filter(Boolean).join(", ");
  return `
    <p style="color:#2b2118;margin:4px 0;"><b>Cliente:</b> ${escapeHtml(order.cliente_nombre || "—")}</p>
    <p style="color:#2b2118;margin:4px 0;"><b>Teléfono:</b> ${escapeHtml(order.cliente_telefono || "—")}</p>
    <p style="color:#2b2118;margin:4px 0;"><b>Email:</b> ${escapeHtml(order.cliente_email || "—")}</p>
    <p style="color:#2b2118;margin:4px 0;"><b>Envío a:</b> ${escapeHtml(dir || "—")}</p>`;
}

/**
 * Envía los correos al confirmarse el pago de un pedido:
 *  - confirmación al cliente (si tenemos su email),
 *  - alerta de venta al administrador.
 * Nunca lanza: los errores se registran pero no rompen el webhook.
 */
export async function sendPaidOrderEmails(order: Order, fallbackCustomerEmail?: string | null): Promise<void> {
  const resend = getClient();
  if (!resend) return;

  const customerEmail = (order.cliente_email || fallbackCustomerEmail || "").trim();

  // 1) Confirmación al cliente
  if (customerEmail) {
    const body = `
      <p style="color:#5a4a36;">¡Gracias por tu compra, ${escapeHtml(order.cliente_nombre || "")}! Tu pago fue confirmado y ya estamos preparando tu pieza única.</p>
      <p style="color:#2b2118;"><b>Pedido:</b> ${escapeHtml(order.id)}</p>
      ${itemsTable(order)}
      <p style="color:#5a4a36;">Te contactaremos para coordinar el envío y darte el seguimiento. Cualquier duda, responde a este correo.</p>`;
    try {
      await resend.emails.send({
        from: FROM,
        to: customerEmail,
        subject: `Tu pedido ${order.id} está confirmado · ARÜVIA`,
        html: shell("¡Pago confirmado!", body),
      });
    } catch (e) {
      console.error("Error enviando correo al cliente:", e);
    }
  }

  // 2) Alerta de venta al administrador
  if (ADMIN_EMAIL) {
    const body = `
      <p style="color:#5a4a36;">Nueva venta confirmada y pagada.</p>
      <p style="color:#2b2118;"><b>Pedido:</b> ${escapeHtml(order.id)} · <b>Método:</b> ${escapeHtml(order.metodo_pago || "—")}</p>
      ${itemsTable(order)}
      ${clienteResumen(order)}`;
    try {
      await resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `🟢 Nueva venta ${order.id} · ${formatPrice(order.total)}`,
        html: shell("Nueva venta", body),
      });
    } catch (e) {
      console.error("Error enviando alerta de venta:", e);
    }
  }
}
