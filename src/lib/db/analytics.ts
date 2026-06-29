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
  tipo: "lanzamiento" | "reabastecer" | "liquidar" | "promocionar" | "precio" | "concentracion";
  prioridad: "alta" | "media";
  titulo: string;
  detalle: string;
  productos: string[];
}

export interface AnalyticsData {
  configured: boolean;
  // Contexto de etapa del negocio
  etapaLanzamiento: boolean;     // la mayoría del catálogo es muy nuevo (negocio recién arrancando)
  diasMaduracion: number;        // días que un producto debe llevar para evaluar su rotación
  edadCatalogoDias: number;      // antigüedad del producto más viejo (proxy de la vida del negocio)
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
  inventarioMuertoValor: number; // capital en productos MADUROS sin ventas
  enIntroduccionValor: number;   // capital en productos NUEVOS aún sin vender
  // listas
  productos: ProductAnalytics[];
  topVendidos: ProductAnalytics[];
  topIngresos: ProductAnalytics[];
  topGanancia: ProductAnalytics[];
  inventarioMuerto: ProductAnalytics[];  // maduros (>= diasMaduracion) sin vender
  enIntroduccion: ProductAnalytics[];    // nuevos (< diasMaduracion) aún sin vender
  reabastecer: ProductAnalytics[];
  bajoMargen: ProductAnalytics[];
  porCategoria: CategoryAnalytics[];
  ventasPorDia: SalesByDay[];
  recomendaciones: Recommendation[];
}

const EMPTY: AnalyticsData = {
  configured: false,
  etapaLanzamiento: false, diasMaduracion: 30, edadCatalogoDias: 0,
  ingresosTotales: 0, ingresosBrutos: 0, descuentos: 0, gananciaBrutaReal: 0,
  margenBrutoPct: 0, ticketPromedio: 0, unidadesVendidas: 0, pedidosPagados: 0,
  productosVendidosDistintos: 0, capitalEnStock: 0, inventarioMuertoValor: 0, enIntroduccionValor: 0,
  productos: [], topVendidos: [], topIngresos: [], topGanancia: [],
  inventarioMuerto: [], enIntroduccion: [], reabastecer: [], bajoMargen: [], porCategoria: [],
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
const DIAS_MADURACION = 30;      // un producto necesita ≥ estos días para juzgar si "no rota"
                                 // (antes de eso es inventario NUEVO en introducción, no "muerto")

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

  // Sin ventas pero CON stock. Separar por madurez:
  //  - inventarioMuerto: ya tuvo tiempo suficiente (>= DIAS_MADURACION) y no rotó → problema real.
  //  - enIntroduccion: producto NUEVO que aún no ha tenido oportunidad → normal, no alarmar.
  const sinVentasConStock = productos.filter((p) => p.unidadesVendidas === 0 && p.stock > 0);
  const inventarioMuerto = sinVentasConStock
    .filter((p) => p.diasDesdeAlta >= DIAS_MADURACION)
    .sort((a, b) => b.capitalEnStock - a.capitalEnStock);
  const enIntroduccion = sinVentasConStock
    .filter((p) => p.diasDesdeAlta < DIAS_MADURACION)
    .sort((a, b) => b.capitalEnStock - a.capitalEnStock);
  const inventarioMuertoValor = inventarioMuerto.reduce((s, p) => s + p.capitalEnStock, 0);
  const enIntroduccionValor = enIntroduccion.reduce((s, p) => s + p.capitalEnStock, 0);

  // Etapa de lanzamiento: la mayoría del catálogo es muy nuevo (negocio recién arrancando).
  const edadCatalogoDias = productos.reduce((m, p) => Math.max(m, p.diasDesdeAlta), 0);
  const nuevos = productos.filter((p) => p.diasDesdeAlta < DIAS_MADURACION).length;
  const etapaLanzamiento = productos.length > 0 && nuevos / productos.length >= 0.6;

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

  // ---------- Recomendaciones accionables (conscientes de la etapa) ----------
  const recomendaciones: Recommendation[] = [];

  // En lanzamiento: el catálogo es nuevo y aún no hay marketing. Que algo no
  // haya vendido todavía es NORMAL. El cuello de botella es el tráfico.
  if (etapaLanzamiento) {
    recomendaciones.push({
      tipo: "lanzamiento",
      prioridad: "alta",
      titulo: "Estás en etapa de lanzamiento: el foco es atraer tráfico",
      detalle: `Tu inventario es nuevo (catálogo de ~${edadCatalogoDias} ${edadCatalogoDias === 1 ? "día" : "días"}) y todavía no has hecho marketing. Que la mayoría de productos aún no haya vendido es esperable, NO inventario muerto. Ahora el límite no es el catálogo sino las visitas: termina la infraestructura y empieza a generar tráfico.`,
      productos: [
        "Activar correos transaccionales (genera confianza al comprar)",
        "Publicar el catálogo en Instagram / WhatsApp Estados",
        "Elegir 2-3 mochilas 'gancho' para anunciar primero",
        "Instalar analítica web (Plausible/GA + Meta Pixel) para medir visitas",
        "Conseguir las primeras reseñas reales de clientes",
      ],
    });
  }

  if (reabastecer.length) {
    recomendaciones.push({
      tipo: "reabastecer",
      // En lanzamiento es señal de demanda temprana, no urgencia: prioridad media.
      prioridad: etapaLanzamiento ? "media" : "alta",
      titulo: etapaLanzamiento ? "Estos ya muestran demanda temprana" : "Reabastece tus productos que venden",
      detalle: etapaLanzamiento
        ? `${reabastecer.length} ${reabastecer.length === 1 ? "producto ya vendió" : "productos ya vendieron"} sin marketing y quedan en ${UMBRAL_STOCK_BAJO} o menos. Son tus primeras señales de qué funciona: ten lista la reposición con la tejedora para cuando arranque la demanda.`
        : `${reabastecer.length} ${reabastecer.length === 1 ? "producto vende" : "productos venden"} y ya están en ${UMBRAL_STOCK_BAJO} o menos unidades. Estás a punto de perder ventas por falta de stock.`,
      productos: reabastecer.slice(0, 6).map((p) => `${p.nombre} (vendió ${p.unidadesVendidas}, ${p.stock === 0 ? "agotado" : `quedan ${p.stock}`})`),
    });
  }

  if (topGanancia.length) {
    recomendaciones.push({
      tipo: "promocionar",
      prioridad: "media",
      titulo: "Empuja tus productos más rentables",
      detalle: "Estos son los que más ganancia real te han dejado hasta ahora. Dales protagonismo (destacados en la tienda, redes, recomendación en el POS) para vender más de lo que ya funciona.",
      productos: topGanancia.slice(0, 5).map((p) => `${p.nombre} (ganancia $${p.gananciaBruta.toLocaleString("es-CO")}, margen ${Math.round(p.margenPct * 100)}%)`),
    });
  }

  // Inventario muerto SOLO si es maduro (>= DIAS_MADURACION sin vender). En un
  // negocio nuevo esto normalmente está vacío y la recomendación no aparece.
  if (inventarioMuerto.length) {
    recomendaciones.push({
      tipo: "liquidar",
      prioridad: inventarioMuertoValor > capitalEnStock * 0.25 ? "alta" : "media",
      titulo: "Libera capital atrapado en inventario que no rota",
      detalle: `${inventarioMuerto.length} productos llevan ${DIAS_MADURACION}+ días con stock y no han vendido ni una unidad. Tienen $${inventarioMuertoValor.toLocaleString("es-CO")} de tu capital atrapado. Considera promoción, combo o bajar precio para liquidarlos.`,
      productos: inventarioMuerto.slice(0, 6).map((p) => `${p.nombre} (${p.stock} u · $${p.capitalEnStock.toLocaleString("es-CO")} · ${p.diasDesdeAlta} días)`),
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

  // Concentración: relevante cuando ya hay historial. En lanzamiento (pocos días,
  // ventas iniciales a conocidos) no aporta, así que se omite.
  if (!etapaLanzamiento && topIngresos.length >= 4 && ingresosBrutos > 0) {
    const top3 = topIngresos.slice(0, 3).reduce((s, p) => s + p.ingresos, 0);
    const pctTop = Math.round((top3 / ingresosBrutos) * 100);
    if (pctTop >= 60) {
      recomendaciones.push({
        tipo: "concentracion",
        prioridad: "media",
        titulo: "Tus ventas dependen de pocos productos",
        detalle: `El ${pctTop}% de tus ingresos viene de solo 3 productos. Es bueno saber qué funciona, pero diversifica las apuestas para no depender tanto de ellos (y asegúrate de nunca quedarte sin esos).`,
        productos: topIngresos.slice(0, 3).map((p) => `${p.nombre} ($${p.ingresos.toLocaleString("es-CO")})`),
      });
    }
  }

  return {
    configured: true,
    etapaLanzamiento, diasMaduracion: DIAS_MADURACION, edadCatalogoDias,
    ingresosTotales, ingresosBrutos, descuentos, gananciaBrutaReal,
    margenBrutoPct: ingresosBrutos > 0 ? gananciaBrutaReal / ingresosBrutos : 0,
    ticketPromedio: paid.length ? Math.round(ingresosTotales / paid.length) : 0,
    unidadesVendidas,
    pedidosPagados: paid.length,
    productosVendidosDistintos,
    capitalEnStock,
    inventarioMuertoValor,
    enIntroduccionValor,
    productos,
    topVendidos, topIngresos, topGanancia,
    inventarioMuerto, enIntroduccion, reabastecer, bajoMargen,
    porCategoria, ventasPorDia,
    recomendaciones,
  };
}
