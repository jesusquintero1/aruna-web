"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { createOrder, OrderError, type OrderItemInput } from "@/lib/db/orders";
import { updateOrderStatus, updateOrderFull, deleteOrder, type Order } from "@/lib/db/orders";

export interface PosSaleInput {
  items: OrderItemInput[];
  metodoPago: string;
  /** Descuento global sobre el subtotal (COP). */
  descuento?: number;
  cliente?: {
    nombre?: string;
    telefono?: string;
    cedula?: string;
    direccion?: string;
    ciudad?: string;
    departamento?: string;
  };
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
      cliente: {
        nombre: input.cliente?.nombre,
        telefono: input.cliente?.telefono,
        cedula: input.cliente?.cedula,
        direccion: input.cliente?.direccion,
        ciudad: input.cliente?.ciudad,
        departamento: input.cliente?.departamento,
      },
      notas: input.notas,
      descuento: input.descuento,
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

function revalidateOrders(id?: string) {
  revalidatePath("/admin/pedidos");
  if (id) revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/compras");
  revalidatePath("/");
  revalidatePath("/catalogo");
}

/** Elimina un pedido y devuelve el stock al inventario. */
export async function deleteOrderAction(formData: FormData): Promise<void> {
  await verifySession();
  const id = String(formData.get("id") || "");
  if (id) await deleteOrder(id);
  revalidateOrders();
  redirect("/admin/pedidos");
}

export interface OrderEditInput {
  id: string;
  estado: "pendiente" | "pagado" | "enviado" | "cancelado";
  metodoPago?: string | null;
  cliente?: {
    nombre?: string | null;
    telefono?: string | null;
    email?: string | null;
    cedula?: string | null;
    ciudad?: string | null;
    departamento?: string | null;
    direccion?: string | null;
  };
  notas?: string | null;
  descuento?: number;
  items: OrderItemInput[];
}

/** Edición completa de un pedido (cliente, estado, ítems y descuento). */
export async function updateOrderAction(input: OrderEditInput): Promise<PosSaleResult> {
  await verifySession();
  try {
    if (!input.items?.length) return { ok: false, error: "El pedido debe tener al menos un producto." };
    const { id } = await updateOrderFull({
      id: input.id,
      estado: input.estado,
      metodoPago: input.metodoPago,
      cliente: input.cliente,
      notas: input.notas,
      descuento: input.descuento,
      items: input.items,
    });
    revalidateOrders(id);
    return { ok: true, id };
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message };
    return { ok: false, error: "No se pudo guardar el pedido." };
  }
}
