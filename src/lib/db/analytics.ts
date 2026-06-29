import "server-only";
import { getSupabase } from "@/lib/supabase/server";

/**
 * Capa de analítica de negocio. Lee las tablas base de Supabase y calcula
 * métricas accionables (ventas, márgenes, rotación, inventario muerto,
 * tendencia y recomendaciones) en memoria. Todos los montos en COP.
 *
 * Nota sobre el COGS (costo de lo vendido): se estima con el costo ACTUAL del
 * producto (products.costo), no con el costo histórico del lote vendido (no se
 * guarda snapshot de costo en order_items). Es una aproximación razonable.
 */

const ESTADOS_PAGADOS = ["pagado", "enviado"];

export interface ProductAnalytics {
  id: string;
  nombre: string;
  categoria: string;
  simbolo: string;
  stock: number;
  costo: number;
  precio: number;
  diasDesdeAlta: number;
  unidadesVendidas: number;
  ingresos: number;          // Σ order_items.subtotal (pedidos pagados)
  cogs: number;              // unidadesVendidas × costo actual
  gananciaBruta: number;     // ingresos − cogs (aporte real a la ganancia)
  margenUnitario: number;    // precio − costo
  margenPct: number;         // margenUnitario / precio (0..1)
  capitalEnStock: number;    // stock × costo
  valorVentaStock: number;   // stock × precio
}

export interface SalesByDay {
  fecha: string;             // YYYY-MM-DD
  pedidos: number;
  unidades: number;
  ingresos: number;
}

export interface CategoryAnalytics {
  categoria: string;
  unidades: number;
  ingresos: number;
  ganancia: number;
  capitalEnStock: number;
}

export interface Recommendation {
  tipo: "reabastecer" | "liquidar" | "promocionar" | "precio" | "concentracion";
  prioridad: "alta" | "media";
  titulo: string;
  detalle: string;
  productos: string[];
}

export interface AnalyticsData {
  configured: boolean;
  // KPIs
  ingresosTotales: number;       // Σ total de pedidos pagados (neto de descuentos)
  ingresosBrutos: number;        // Σ subtotales de ítems (antes de descuento)
  descuentos: number;
  gananciaBrutaReal: number;     // ingresosBrutos − COGS
  margenBrutoPct: number;        // gananciaBrutaReal / ingresosBrutos
  ticketPromedio: number;
  unidadesVendidas: number;
  pedidosPagados: number;
  productosVendidosDistintos: number;
  capitalEnStock: number;        // Σ stock × costo
  inventarioMuertoValor: number; // capital atrapado en productos sin ventas
  // listas
  productos: ProductAnalytics[];
  topVendidos: ProductAnalytics[];
  topIngresos: ProductAnalytics[];
  topGanancia: ProductAnalytics[];
  inventarioMuerto: ProductAnalytics[];
  reabastecer: ProductAnalytics[];
  bajoMargen: ProductAnalytics[];
  porCategoria: CategoryAnalytics[];
  ventasPorDia: SalesByDay[];
  recomendaciones: Recommendation[];
}

const EMPTY: AnalyticsData = {
  configured: false,
  ingresosTotales: 0, ingresosBrutos: 0, descuentos: 0, gananciaBrutaReal: 0,
  margenBrutoPct: 0, ticketPromedio: 0, unidadesVendidas: 0, pedidosPagados: 0,
  productosVendidosDistintos: 0, capitalEnStock: 0, inventarioMuertoValor: 0,
  productos: [], topVendidos: [], topIngresos: [], topGanancia: [],
  inventarioMuerto: [], reabastecer: [], bajoMargen: [], porCategoria: [],
  ventasPorDia: [], recomendaciones: [],
};

interface ProductRow {
  id: string; nombre: string; stock: number; costo: number | null; precio: number;
  categoria_id: string | null; simbolo: string; created_at: string;
  categories: { nombre: string } | null;
}
interface OrderRow { id: string; estado: string; total: number; subtotal: number; descuento: number; created_at: string; }
interface ItemRow { order_id: string; product_id: string | null; cantidad: number; subtotal: number; }

const UMBRAL_BAJO_MARGEN = 0.3;  // < 30% margen → revisar precio/costo
const UMBRAL_STOCK_BAJO = 1;     // ≤ 1 unidad → reabastecer si vende

export async function getAnalytics(): Promise<AnalyticsData> {
  const db = getSupabase();
  if (!db) return EMPTY;

  const [prodRes, ordRes, itemRes] = await Promise.all([
    db.from("products").select("id, nombre, stock, costo, precio, categoria_id, simbolo, created_at, categories(nombre)"),
    db.from("orders").select("id, estado, total, subtotal, descuento, created_at"),
    db.from("order_items").select("order_id, product_id, cantidad, subtotal"),
  ]);

  const productsRaw = (prodRes.data ?? []) as unknown as ProductRow[];
  const orders = (ordRes.data ?? []) as OrderRow[];
  const items = (itemRes.data ?? []) as ItemRow[];

  // Pedidos pagados y sus fechas.
  const paid = orders.filter((o) => ESTADOS_PAGADOS.includes(o.estado));
  const paidIds = new Set(paid.map((o) => o.id));
  const orderFecha = new Map(orders.map((o) => [o.id, (o.created_at || "").slice(0, 10)]));

  // Ventas por producto (solo pedidos pagados).
  const ventasPorProducto = new Map<string, { unidades: number; ingresos: number }>();
  let ingresosBrutos = 0;
  for (const it of items) {
    if (!paidIds.has(it.order_id)) continue;
    ingresosBrutos += it.subtotal;
    if (!it.product_id) continue; // producto borrado: cuenta en ingresos, no por-producto
    const cur = ventasPorProducto.get(it.product_id) ?? { unidades: 0, ingresos: 0 };
    cur.unidades += it.cantidad;
    cur.ingresos += it.subtotal;
    ventasPorProducto.set(it.product_id, cur);
  }

  const ahora = Date.now();
  const productos: ProductAnalytics[] = productsRaw.map((p) => {
    const costo = p.costo ?? 0;
    const v = ventasPorProducto.get(p.id) ?? { unidades: 0, ingresos: 0 };
    const cogs = v.unidades * costo;
    const margenUnitario = p.precio - costo;
    const diasDesdeAlta = Math.max(0, Math.floor((ahora - new Date(p.created_at).getTime()) / 86_400_000));
    return {
      id: p.id,
      nombre: p.nombre,
      categoria: p.categories?.nombre ?? "General",
      simbolo: p.simbolo,
      stock: p.stock,
      costo,
      precio: p.precio,
      diasDesdeAlta,
      unidadesVendidas: v.unidades,
      ingresos: v.ingresos,
      cogs,
      gananciaBruta: v.ingresos - cogs,
      margenUnitario,
      margenPct: p.precio > 0 ? margenUnitario / p.precio : 0,
      capitalEnStock: p.stock * costo,
      valorVentaStock: p.stock * p.precio,
    };
  });

  // KPIs.
  const ingresosTotales = paid.reduce((s, o) => s + o.total, 0);
  const descuentos = paid.reduce((s, o) => s + (o.descuento ?? 0), 0);
  const unidadesVendidas = productos.reduce((s, p) => s + p.unidadesVendidas, 0)
    + items.filter((it) => paidIds.has(it.order_id) && !it.product_id).reduce((s, it) => s + it.cantidad, 0);
  const cogsTotal = productos.reduce((s, p) => s + p.cogs, 0);
  const gananciaBrutaReal = ingresosBrutos - cogsTotal;
  const capitalEnStock = productos.reduce((s, p) => s + p.capitalEnStock, 0);
  const productosVendidosDistintos = productos.filter((p) => p.unidadesVendidas > 0).length;

  // Inventario muerto: con stock, sin una sola venta.
  const inventarioMuerto = productos
    .filter((p) => p.unidadesVendidas === 0 && p.stock > 0)
    .sort((a, b) => b.capitalEnStock - a.capitalEnStock);
  const inventarioMuertoValor = inventarioMuerto.reduce((s, p) => s + p.capitalEnStock, 0);

  // Reabastecer: vende y casi sin stock.
  const reabastecer = productos
    .filter((p) => p.unidadesVendidas > 0 && p.stock <= UMBRAL_STOCK_BAJO)
    .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas);

  // Bajo margen (con precio definido).
  const bajoMargen = productos
    .filter((p) => p.precio > 0 && p.margenPct < UMBRAL_BAJO_MARGEN)
    .sort((a, b) => a.margenPct - b.margenPct);

  const topVendidos = [...productos].filter((p) => p.unidadesVendidas > 0).sort((a, b) => b.unidadesVendidas - a.unidadesVendidas);
  const topIngresos = [...productos].filter((p) => p.ingresos > 0).sort((a, b) => b.ingresos - a.ingresos);
  const topGanancia = [...productos].filter((p) => p.gananciaBruta > 0).sort((a, b) => b.gananciaBruta - a.gananciaBruta);

  // Por categoría.
  const catMap = new Map<string, CategoryAnalytics>();
  for (const p of productos) {
    const c = catMap.get(p.categoria) ?? { categoria: p.categoria, unidades: 0, ingresos: 0, ganancia: 0, capitalEnStock: 0 };
    c.unidades += p.unidadesVendidas;
    c.ingresos += p.ingresos;
    c.ganancia += p.gananciaBruta;
    c.capitalEnStock += p.capitalEnStock;
    catMap.set(p.categoria, c);
  }
  const porCategoria = [...catMap.values()].sort((a, b) => b.ingresos - a.ingresos);

  // Ventas por día (pedidos pagados).
  const diaMap = new Map<string, SalesByDay>();
  for (const o of paid) {
    const f = orderFecha.get(o.id) || "";
    if (!f) continue;
    const d = diaMap.get(f) ?? { fecha: f, pedidos: 0, unidades: 0, ingresos: 0 };
    d.pedidos += 1;
    d.ingresos += o.total;
    diaMap.set(f, d);
  }
  for (const it of items) {
    if (!paidIds.has(it.order_id)) continue;
    const f = orderFecha.get(it.order_id) || "";
    const d = diaMap.get(f);
    if (d) d.unidades += it.cantidad;
  }
  const ventasPorDia = [...diaMap.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));

  // ---------- Recomendaciones accionables ----------
  const recomendaciones: Recommendation[] = [];

  if (reabastecer.length) {
    recomendaciones.push({
      tipo: "reabastecer",
      prioridad: "alta",
      titulo: "Reabastece tus productos que venden",
      detalle: `${reabastecer.length} ${reabastecer.length === 1 ? "producto vende" : "productos venden"} y ya están en ${UMBRAL_STOCK_BAJO} o menos unidades. Estás a punto de perder ventas por falta de stock.`,
      productos: reabastecer.slice(0, 6).map((p) => `${p.nombre} (vendió ${p.unidadesVendidas}, quedan ${p.stock})`),
    });
  }

  if (inventarioMuerto.length) {
    const viejos = inventarioMuerto.filter((p) => p.diasDesdeAlta >= 30);
    const lista = (viejos.length ? viejos : inventarioMuerto);
    recomendaciones.push({
      tipo: "liquidar",
      prioridad: inventarioMuertoValor > capitalEnStock * 0.25 ? "alta" : "media",
      titulo: "Libera capital atrapado en inventario que no rota",
      detalle: `${inventarioMuerto.length} productos con stock no han vendido ni una unidad. Tienen $${inventarioMuertoValor.toLocaleString("es-CO")} de tu capital atrapado. Considera promoción, combo o bajar precio para liquidarlos.`,
      productos: lista.slice(0, 6).map((p) => `${p.nombre} (${p.stock} u · $${p.capitalEnStock.toLocaleString("es-CO")} · ${p.diasDesdeAlta} días)`),
    });
  }

  if (topGanancia.length) {
    recomendaciones.push({
      tipo: "promocionar",
      prioridad: "media",
      titulo: "Empuja tus productos más rentables",
      detalle: "Estos son los que más ganancia real te han dejado. Dales protagonismo (destacados en la tienda, redes, recomendación en el POS) para vender más de lo que ya funciona.",
      productos: topGanancia.slice(0, 5).map((p) => `${p.nombre} (ganancia $${p.gananciaBruta.toLocaleString("es-CO")}, margen ${Math.round(p.margenPct * 100)}%)`),
    });
  }

  if (bajoMargen.length) {
    recomendaciones.push({
      tipo: "precio",
      prioridad: "media",
      titulo: "Revisa precio o costo de tus productos de bajo margen",
      detalle: `${bajoMargen.length} productos dejan menos de ${Math.round(UMBRAL_BAJO_MARGEN * 100)}% de margen. Sube el precio, negocia mejor costo con la tejedora, o evalúa si vale la pena seguir cargándolos.`,
      productos: bajoMargen.slice(0, 6).map((p) => `${p.nombre} (margen ${Math.round(p.margenPct * 100)}% · cuesta $${p.costo.toLocaleString("es-CO")} · vende $${p.precio.toLocaleString("es-CO")})`),
    });
  }

  // Concentración: ¿cuánto del ingreso depende del top 3?
  if (topIngresos.length >= 4 && ingresosBrutos > 0) {
    const top3 = topIngresos.slice(0, 3).reduce((s, p) => s + p.ingresos, 0);
    const pct = Math.round((top3 / ingresosBrutos) * 100);
    if (pct >= 60) {
      recomendaciones.push({
        tipo: "concentracion",
        prioridad: "media",
        titulo: "Tus ventas dependen de pocos productos",
        detalle: `El ${pct}% de tus ingresos viene de solo 3 productos. Es bueno saber qué funciona, pero diversifica las apuestas para no depender tanto de ellos (y asegúrate de nunca quedarte sin esos).`,
        productos: topIngresos.slice(0, 3).map((p) => `${p.nombre} ($${p.ingresos.toLocaleString("es-CO")})`),
      });
    }
  }

  return {
    configured: true,
    ingresosTotales, ingresosBrutos, descuentos, gananciaBrutaReal,
    margenBrutoPct: ingresosBrutos > 0 ? gananciaBrutaReal / ingresosBrutos : 0,
    ticketPromedio: paid.length ? Math.round(ingresosTotales / paid.length) : 0,
    unidadesVendidas,
    pedidosPagados: paid.length,
    productosVendidosDistintos,
    capitalEnStock,
    inventarioMuertoValor,
    productos,
    topVendidos, topIngresos, topGanancia,
    inventarioMuerto, reabastecer, bajoMargen,
    porCategoria, ventasPorDia,
    recomendaciones,
  };
}
