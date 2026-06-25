import { NextRequest, NextResponse } from "next/server";
import { createOrder, OrderError } from "@/lib/db/orders";

/**
 * Crea un pedido online. Los precios/totales se calculan EN EL SERVIDOR
 * (RPC create_order) — nunca se confía en los valores del cliente.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = (Array.isArray(body.items) ? body.items : [])
      .map((i: { product_id?: string; cantidad?: number }) => ({
        product_id: String(i.product_id || ""),
        cantidad: Math.max(1, parseInt(String(i.cantidad ?? 1), 10) || 1),
      }))
      .filter((i: { product_id: string }) => i.product_id);

    if (!items.length) {
      return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
    }

    const { id } = await createOrder({
      channel: "online",
      estado: "pendiente",
      metodoPago: body.metodoPago ?? null,
      cliente: body.cliente ?? {},
      notas: body.notas ?? null,
      items,
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
