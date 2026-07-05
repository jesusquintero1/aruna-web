import "server-only";
import { getSupabase } from "@/lib/supabase/server";
import type { LineaProducto } from "@/data/productos";

export type MovimientoTipo = "inversion" | "gasto" | "ingreso";

export interface FinanceMovement {
  id: string;
  tipo: MovimientoTipo;
  asunto: string;
  descripcion: string | null;
  monto: number;
  fecha: string;
  created_at: string;
}

/** Resumen financiero para el dashboard. Todos los montos en COP. */
export interface FinanceSummary {
  // Inventario actual
  capital: number;          // Σ stock × costo  (dinero invertido en piezas disponibles)
  valorVenta: number;       // Σ stock × precio (si se vende todo el inventario)
  ganancia: number;         // valorVenta − capital

  // Flujo de caja
  inversiones: number;      // capital aportado (movimientos tipo inversión)
  comprasInventario: number; // pagado a proveedores (costo de items + envíos)
  gastos: number;           // gastos operativos (envíos, etc.)
  ingresosManuales: number; // ingresos registrados a mano
  ventasPagadas: number;    // total de pedidos pagados/enviados
  caja: number;             // efectivo estimado disponible

  patrimonio: number;       // caja + capital (valor total del negocio al costo)
}

/**
 * Ventas pagadas/enviadas desglosadas por línea de producto.
 * Se calcula desde order_items (join a products.linea); los ítems cuyo
 * producto fue borrado (product_id null) se agrupan en 'mochilas' por defecto.
 * Nota: usa subtotales de ítems, no descuentos de orden, así que puede
 * diferir levemente del total de la orden cuando hay descuentos.
 */
export async function getVentasPagadasPorLinea(): Promise<Record<LineaProducto, number>> {
  const out: Record<LineaProducto, number> = { mochilas: 0, maquillaje: 0 };
  const db = getSupabase();
  if (!db) return out;
  const { data, error } = await db
    .from("order_items")
    .select("subtotal, orders!inner(estado), products(linea)");
  if (error || !data) return out;
  for (const row of data as unknown as Array<{ subtotal: number; orders: { estado: string }; products: { linea: LineaProducto | null } | null }>) {
    const estado = row.orders?.estado;
    if (estado !== "pagado" && estado !== "enviado") continue;
    const linea = row.products?.linea ?? "mochilas";
    out[linea] += row.subtotal ?? 0;
  }
  return out;
}

export async function getFinanceMovements(): Promise<FinanceMovement[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data, error } = await db
    .from("finance_movements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as FinanceMovement[];
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const empty: FinanceSummary = {
    capital: 0, valorVenta: 0, ganancia: 0,
    inversiones: 0, comprasInventario: 0, gastos: 0, ingresosManuales: 0,
    ventasPagadas: 0, caja: 0, patrimonio: 0,
  };

  const db = getSupabase();
  if (!db) return empty;

  const [prodRes, ordRes, purItemsRes, purOrdRes, movRes] = await Promise.all([
    db.from("products").select("stock, costo, precio"),
    db.from("orders").select("total, estado"),
    db.from("purchase_items").select("cantidad, costo_unitario"),
    db.from("purchase_orders").select("costo_envio"),
    db.from("finance_movements").select("tipo, monto"),
  ]);

  const prods = (prodRes.data ?? []) as Array<{ stock: number; costo: number | null; precio: number }>;
  const capital = prods.reduce((s, p) => s + p.stock * (p.costo ?? 0), 0);
  const valorVenta = prods.reduce((s, p) => s + p.stock * p.precio, 0);
  const ganancia = valorVenta - capital;

  const orders = (ordRes.data ?? []) as Array<{ total: number; estado: string }>;
  const ventasPagadas = orders
    .filter((o) => o.estado === "pagado" || o.estado === "enviado")
    .reduce((s, o) => s + o.total, 0);

  const purItems = (purItemsRes.data ?? []) as Array<{ cantidad: number; costo_unitario: number }>;
  const purOrders = (purOrdRes.data ?? []) as Array<{ costo_envio: number }>;
  const comprasInventario =
    purItems.reduce((s, i) => s + i.cantidad * i.costo_unitario, 0) +
    purOrders.reduce((s, o) => s + (o.costo_envio ?? 0), 0);

  const movs = (movRes.data ?? []) as Array<{ tipo: MovimientoTipo; monto: number }>;
  const inversiones = movs.filter((m) => m.tipo === "inversion").reduce((s, m) => s + m.monto, 0);
  const gastos = movs.filter((m) => m.tipo === "gasto").reduce((s, m) => s + m.monto, 0);
  const ingresosManuales = movs.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + m.monto, 0);

  // Caja estimada = lo que entró − lo que salió
  const caja = inversiones + ventasPagadas + ingresosManuales - comprasInventario - gastos;
  const patrimonio = caja + capital;

  return {
    capital, valorVenta, ganancia,
    inversiones, comprasInventario, gastos, ingresosManuales,
    ventasPagadas, caja, patrimonio,
  };
}
