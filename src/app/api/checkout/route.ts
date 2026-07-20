import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrderById, OrderError } from "@/lib/db/orders";
import { orderBodySchema } from "@/lib/validation/schemas";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { createPreference, isMpConfigured } from "@/lib/payments/mercadopago";

/**
 * Inicia el checkout online:
 *  1) crea el pedido en estado 'pendiente' (reserva stock; precios calculados en la DB),
 *  2) crea una preferencia de Mercado Pago (Checkout Pro) con esos precios,
 *  3) devuelve { init_point } para redirigir al pago.
 *
 * Si Mercado Pago no está configurado, devuelve solo { orderId } (flujo manual de respaldo).
 */
export async function POST(req: NextRequest) {
  try {
    const ip = await clientIp(req.headers);
    const allowed = await rateLimit(`checkout:ip:${ip}`, 12, 60, { failOpen: true });
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    const raw = await req.json().catch(() => null);
    const parsed = orderBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos del pedido inválidos." }, { status: 400 });
    }
    const body = parsed.data;

    // 1) Crear el pedido (estado pendiente; el RPC valida stock y calcula totales).
    const { id } = await createOrder({
      channel: "online",
      estado: "pendiente",
      metodoPago: "Mercado Pago",
      cliente: body.cliente ?? {},
      notas: body.notas ?? null,
      items: body.items,
    });

    // 2) Crear preferencia de pago, si Mercado Pago está configurado.
    if (isMpConfigured()) {
      const order = await getOrderById(id);
      if (order) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
        try {
          const pref = await createPreference(order, baseUrl);
          if (pref?.init_point) {
            return NextResponse.json({ orderId: id, init_point: pref.init_point });
          }
        } catch (e) {
          // Si createPreference lanza, NO dejamos que escale a un 500 con el pedido
          // ya creado (stock reservado sin respuesta útil): caemos al respaldo manual.
          console.error("createPreference falló:", e);
        }
      }
      // Si falla la creación de la preferencia, devolvemos el pedido igual (respaldo manual).
      return NextResponse.json({ orderId: id, init_point: null });
    }

    // Sin Mercado Pago configurado: flujo manual de respaldo.
    return NextResponse.json({ orderId: id, init_point: null });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("Error /api/checkout:", e);
    return NextResponse.json({ error: "No se pudo procesar el pedido. Intenta de nuevo." }, { status: 500 });
  }
}
