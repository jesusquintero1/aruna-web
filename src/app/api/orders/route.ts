import { NextRequest, NextResponse } from "next/server";
import { createOrder, OrderError } from "@/lib/db/orders";
import { orderBodySchema } from "@/lib/validation/schemas";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";

/**
 * Crea un pedido online. Los precios/totales se calculan EN EL SERVIDOR
 * (RPC create_order) — nunca se confía en los valores del cliente.
 * Protegido con rate limit por IP y validación de esquema (Zod).
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit por IP (fail-open: no bloquear ventas por un hipo de DB).
    const ip = await clientIp(req.headers);
    const allowed = await rateLimit(`orders:ip:${ip}`, 12, 60, { failOpen: true });
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

    const { id } = await createOrder({
      channel: "online",
      estado: "pendiente",
      metodoPago: body.metodoPago ?? null,
      cliente: body.cliente ?? {},
      notas: body.notas ?? null,
      items: body.items,
    });

    return NextResponse.json({ id });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("Error /api/orders:", e);
    return NextResponse.json({ error: "No se pudo procesar el pedido. Intenta de nuevo." }, { status: 500 });
  }
}
