import "server-only";
import { getSupabase } from "@/lib/supabase/server";

// ============================================================
// Tipos
// ============================================================
export interface PurchaseItemInput {
  /** id del producto existente, o slug propuesto si es nuevo */
  product_id: string;
  is_new: boolean;
  nombre?: string;
  descripcion?: string;
  referencia?: string;
  cantidad: number;
  costo_unitario: number;
  precio_venta: number;
  categoria_id?: string | null;
  simbolo?: string;
  destacado?: boolean;
}

export interface CreatePurchaseInput {
  proveedor?: string | null;
  fecha?: string | null;
  costoEnvio?: number;
  notas?: string | null;
  items: PurchaseItemInput[];
}

export interface PurchaseItem {
  id: string;
  purchase_order_id: string;
  product_id: string | null;
  referencia: string | null;
  cantidad: number;
  costo_unitario: number;
  precio_venta: number;
  created_at: string;
  products?: { nombre: string } | null;
}

export interface PurchaseOrder {
  id: string;
  proveedor: string | null;
  fecha: string;
  costo_envio: number;
  notas: string | null;
  created_at: string;
  purchase_items?: PurchaseItem[];
}

/** Lote de una referencia (para la vista de inventario por pedido). */
export interface Lote {
  purchase_order_id: string;
  proveedor: string | null;
  fecha: string;
  cantidad: number;          // unidades compradas en este lote
  restantes: number;         // unidades que aún quedan (FIFO sobre el stock actual)
  costo_unitario: number;
  precio_venta: number;
}

/** Inventario agrupado por referencia con sus lotes de compra. */
export interface InventarioReferencia {
  product_id: string;
  nombre: string;
  stockActual: number;
  lotes: Lote[];
}

export class PurchaseError extends Error {}

function generatePurchaseId(): string {
  return "PROV-" + Math.floor(100000 + Math.random() * 900000);
}

// ============================================================
// Crear pedido de proveedor (RPC transaccional)
// ============================================================
export async function createPurchaseOrder(input: CreatePurchaseInput): Promise<{ id: string }> {
  const items = (input.items || []).filter((i) => i.product_id && i.cantidad > 0);
  if (!items.length) throw new PurchaseError("Agrega al menos una referencia con cantidad.");

  const id = generatePurchaseId();
  const db = getSupabase();
  if (!db) return { id };

  const { data, error } = await db.rpc("apply_purchase_order", {
    p_id: id,
    p_proveedor: input.proveedor ?? null,
    p_fecha: input.fecha || null,
    p_costo_envio: input.costoEnvio ?? 0,
    p_notas: input.notas ?? null,
    p_items: items,
  });

  if (error) throw new PurchaseError(error.message || "No se pudo guardar el pedido.");
  return { id: (data as string) ?? id };
}

// ============================================================
// Lecturas
// ============================================================
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data, error } = await db
    .from("purchase_orders")
    .select("*, purchase_items(*)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as PurchaseOrder[];
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  const db = getSupabase();
  if (!db) return null;
  const { data, error } = await db
    .from("purchase_orders")
    .select("*, purchase_items(*, products(nombre))")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as PurchaseOrder;
}

/**
 * Inventario por referencia: para cada producto, sus lotes de compra y
 * cuántas unidades quedan de cada lote (FIFO: se consumen primero los más antiguos).
 */
export async function getInventoryByReference(): Promise<InventarioReferencia[]> {
  const db = getSupabase();
  if (!db) return [];

  const [{ data: items }, { data: prods }] = await Promise.all([
    db.from("purchase_items").select("*, purchase_orders(proveedor, fecha)").order("created_at", { ascending: true }),
    db.from("products").select("id, nombre, stock"),
  ]);
  if (!items || !prods) return [];

  const stockById = new Map(prods.map((p) => [p.id as string, p.stock as number]));
  const nombreById = new Map(prods.map((p) => [p.id as string, p.nombre as string]));

  // Agrupar lotes por producto (ya vienen ordenados por fecha asc)
  const porProducto = new Map<string, Lote[]>();
  for (const it of items as Array<PurchaseItem & { purchase_orders?: { proveedor: string | null; fecha: string } }>) {
    if (!it.product_id) continue;
    const arr = porProducto.get(it.product_id) ?? [];
    arr.push({
      purchase_order_id: it.purchase_order_id,
      proveedor: it.purchase_orders?.proveedor ?? null,
      fecha: it.purchase_orders?.fecha ?? it.created_at,
      cantidad: it.cantidad,
      restantes: 0,
      costo_unitario: it.costo_unitario,
      precio_venta: it.precio_venta,
    });
    porProducto.set(it.product_id, arr);
  }

  const result: InventarioReferencia[] = [];
  for (const [pid, lotes] of porProducto) {
    if (!nombreById.has(pid)) continue; // producto borrado
    const stockActual = stockById.get(pid) ?? 0;
    // FIFO: lo vendido sale de los lotes más antiguos primero.
    const comprado = lotes.reduce((s, l) => s + l.cantidad, 0);
    let vendido = Math.max(0, comprado - stockActual);
    for (const l of lotes) {
      const restan = Math.max(0, l.cantidad - vendido);
      l.restantes = restan;
      vendido = Math.max(0, vendido - l.cantidad);
    }
    result.push({ product_id: pid, nombre: nombreById.get(pid)!, stockActual, lotes });
  }
  // Orden alfabético por nombre
  result.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return result;
}
