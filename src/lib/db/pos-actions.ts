"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/session";
import { createOrder, OrderError, type OrderItemInput } from "@/lib/db/orders";
import { updateOrderStatus, type Order } from "@/lib/db/orders";

export interface PosSaleInput {
  items: OrderItemInput[];
  metodoPago: string;
  cliente?: { nombre?: string; telefono?: string };
  notas?: string;
}

export interface PosSaleResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Registra una venta presencial (POS): pedido pagado, descuenta stock. */
export async function createPosSale(input: PosSaleInput): Promise<PosSaleResult> {
  await verifySession();
  try {
    if (!input.items?.length) return { ok: false, error: "Agrega al menos un producto." };
    const { id } = await createOrder({
      channel: "pos",
      estado: "pagado",
      metodoPago: input.metodoPago,
      cliente: { nombre: input.cliente?.nombre, telefono: input.cliente?.telefono },
      notas: input.notas,
      items: input.items,
    });
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/productos");
    return { ok: true, id };
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message };
    return { ok: false, error: "No se pudo registrar la venta." };
  }
}

/** Cambia el estado de un pedido desde el admin. */
export async function changeOrderStatus(formData: FormData): Promise<void> {
  await verifySession();
  const id = String(formData.get("id") || "");
  const estado = String(formData.get("estado") || "") as Order["estado"];
  await updateOrderStatus(id, estado);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}
