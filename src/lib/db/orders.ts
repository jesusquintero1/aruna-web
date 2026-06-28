import "server-only";
import { getSupabase } from "@/lib/supabase/server";

export interface OrderItemInput {
  product_id: string;
  cantidad: number;
  /** Precio unitario final (override del POS). Si se omite o es <= 0 se usa el de la DB. */
  precio_unitario?: number;
}

export interface OrderCliente {
  nombre?: string | null;
  telefono?: string | null;
  email?: string | null;
  cedula?: string | null;
  ciudad?: string | null;
  departamento?: string | null;
  direccion?: string | null;
}

export interface CreateOrderInput {
  channel: "online" | "pos";
  estado: "pendiente" | "pagado" | "enviado" | "cancelado";
  metodoPago?: string | null;
  cliente?: OrderCliente;
  notas?: string | null;
  /** Descuento global sobre el subtotal (en COP). */
  descuento?: number;
  items: OrderItemInput[];
}

export interface UpdateOrderInput {
  id: string;
  estado: "pendiente" | "pagado" | "enviado" | "cancelado";
  metodoPago?: string | null;
  cliente?: OrderCliente;
  notas?: string | null;
  descuento?: number;
  items: OrderItemInput[];
}

export interface OrderItem {
  nombre_snapshot: string;
  precio_snapshot: number;
  cantidad: number;
  subtotal: number;
  product_id: string | null;
}

export interface Order {
  id: string;
  channel: "online" | "pos";
  estado: string;
  metodo_pago: string | null;
  subtotal: number;
  total: number;
  descuento: number;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_cedula: string | null;
  cliente_ciudad: string | null;
  cliente_departamento: string | null;
  cliente_direccion: string | null;
  notas: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

function generateOrderId(): string {
  return "ARN-" + Math.floor(100000 + Math.random() * 900000);
}

/** Error de negocio legible (p. ej. sin stock). */
export class OrderError extends Error {}

/**
 * Crea un pedido (online o POS) usando el RPC transaccional `create_order`.
 * Los precios y totales se calculan EN LA BASE DE DATOS (no se confía en el cliente).
 * Sin DB configurada: genera un id simulado para no romper el checkout.
 */
export async function createOrder(input: CreateOrderInput): Promise<{ id: string }> {
  if (!input.items?.length) throw new OrderError("El carrito está vacío.");

  const id = generateOrderId();
  const db = getSupabase();
  if (!db) {
    // Fallback sin persistencia (modo demo hasta configurar Supabase)
    return { id };
  }

  const { data, error } = await db.rpc("create_order", {
    p_id: id,
    p_channel: input.channel,
    p_estado: input.estado,
    p_metodo_pago: input.metodoPago ?? null,
    p_cliente_nombre: input.cliente?.nombre ?? null,
    p_cliente_telefono: input.cliente?.telefono ?? null,
    p_cliente_email: input.cliente?.email ?? null,
    p_cliente_cedula: input.cliente?.cedula ?? null,
    p_cliente_ciudad: input.cliente?.ciudad ?? null,
    p_cliente_departamento: input.cliente?.departamento ?? null,
    p_cliente_direccion: input.cliente?.direccion ?? null,
    p_notas: input.notas ?? null,
    p_items: input.items,
    p_descuento: Math.max(0, Math.round(input.descuento ?? 0)),
  });

  if (error) throw mapOrderError(error.message);

  return { id: (data as string) ?? id };
}

/** Traduce errores del RPC a mensajes de negocio legibles. */
function mapOrderError(message: string | undefined): OrderError {
  const msg = message || "";
  if (msg.includes("SIN_STOCK")) {
    const nombre = msg.split("SIN_STOCK:")[1]?.trim() || "una pieza";
    return new OrderError(`Lo sentimos, "${nombre}" acaba de agotarse.`);
  }
  if (msg.includes("PRODUCTO_NO_EXISTE")) {
    return new OrderError("Uno de los productos ya no está disponible.");
  }
  if (msg.includes("PEDIDO_NO_EXISTE")) {
    return new OrderError("El pedido ya no existe.");
  }
  return new OrderError("No se pudo procesar el pedido. Intenta de nuevo.");
}

/** Edición completa de un pedido (incluye ítems; repone y vuelve a descontar stock). */
export async function updateOrderFull(input: UpdateOrderInput): Promise<{ id: string }> {
  if (!input.items?.length) throw new OrderError("El pedido debe tener al menos un producto.");
  const db = getSupabase();
  if (!db) return { id: input.id };

  const { data, error } = await db.rpc("update_order", {
    p_id: input.id,
    p_estado: input.estado,
    p_metodo_pago: input.metodoPago ?? null,
    p_cliente_nombre: input.cliente?.nombre ?? null,
    p_cliente_telefono: input.cliente?.telefono ?? null,
    p_cliente_email: input.cliente?.email ?? null,
    p_cliente_cedula: input.cliente?.cedula ?? null,
    p_cliente_ciudad: input.cliente?.ciudad ?? null,
    p_cliente_departamento: input.cliente?.departamento ?? null,
    p_cliente_direccion: input.cliente?.direccion ?? null,
    p_notas: input.notas ?? null,
    p_items: input.items,
    p_descuento: Math.max(0, Math.round(input.descuento ?? 0)),
  });

  if (error) throw mapOrderError(error.message);
  return { id: (data as string) ?? input.id };
}

/** Elimina un pedido y devuelve el stock al inventario. */
export async function deleteOrder(id: string): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  const { error } = await db.rpc("delete_order", { p_id: id });
  if (error) throw mapOrderError(error.message);
}

/** Lista de pedidos (admin). */
export async function getOrders(): Promise<Order[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data, error } = await db.from("orders").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Order[];
}

/** Un pedido con sus ítems (admin). */
export async function getOrderById(id: string): Promise<Order | null> {
  const db = getSupabase();
  if (!db) return null;
  const { data, error } = await db.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Order;
}

/** Cambia el estado de un pedido (admin). */
export async function updateOrderStatus(id: string, estado: Order["estado"]): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  await db.from("orders").update({ estado }).eq("id", id);
}

/** Marca un pedido como pagado (solo si estaba pendiente). Lo usa el webhook de pago. */
export async function markOrderPaid(id: string, ref: string | null): Promise<boolean> {
  const db = getSupabase();
  if (!db) return false;
  const { data, error } = await db.rpc("mark_order_paid", { p_id: id, p_ref: ref });
  if (error) return false;
  return data === true;
}

/** Libera un pedido no pagado: repone stock y lo cancela. Lo usa el webhook si el pago falla. */
export async function releaseOrder(id: string): Promise<boolean> {
  const db = getSupabase();
  if (!db) return false;
  const { data, error } = await db.rpc("release_order", { p_id: id });
  if (error) return false;
  return data === true;
}
