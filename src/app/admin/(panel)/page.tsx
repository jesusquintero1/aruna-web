import Link from "next/link";
import { getProductsAdmin } from "@/lib/db/products";
import { getOrders } from "@/lib/db/orders";
import { getFinanceSummary, getFinanceMovements, getVentasPagadasPorLinea } from "@/lib/db/finance";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import FinancePanel from "@/components/admin/FinancePanel";
import PushToggle from "@/components/admin/PushToggle";
import type { LineaProducto } from "@/data/productos";
import { Package, ShoppingBag, TrendingUp, AlertTriangle, Plus, Calculator, Wallet, Boxes, Coins, ShoppingBasket, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productos, pedidos, fin, movimientos, ventasPorLinea] = await Promise.all([
    getProductsAdmin(),
    getOrders(),
    getFinanceSummary(),
    getFinanceMovements(),
    getVentasPagadasPorLinea(),
  ]);
  const configured = isSupabaseConfigured();

  // Desglose por línea (mochilas vs maquillaje)
  const lineas = (["mochilas", "maquillaje"] as LineaProducto[]).map((linea) => {
    const prods = productos.filter((p) => p.linea === linea);
    const unidades = prods.reduce((s, p) => s + Math.max(0, p.stock), 0);
    const capital = prods.reduce((s, p) => s + Math.max(0, p.stock) * p.costo, 0);
    const valorVenta = prods.reduce((s, p) => s + Math.max(0, p.stock) * p.precio, 0);
    return {
      linea,
      nombre: linea === "maquillaje" ? "Maquillaje" : "Mochilas Wayuu",
      icon: linea === "maquillaje" ? Sparkles : ShoppingBasket,
      productos: prods.length,
      unidades,
      capital,
      valorVenta,
      ventas: ventasPorLinea[linea],
    };
  });

  // Unidades disponibles = suma del stock de todas las referencias (NO el número
  // de productos/categorías). Una referencia con 5 unidades cuenta como 5.
  const unidadesDisponibles = productos.reduce((s, p) => s + Math.max(0, p.stock), 0);
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock <= 1);
  const recientes = pedidos.slice(0, 5);

  // Desglose de "si vendo todo" en capital vs ganancia
  const pctCapital = fin.valorVenta > 0 ? Math.round((fin.capital / fin.valorVenta) * 100) : 0;
  const pctGanancia = 100 - pctCapital;

  const finanzas = [
    { label: "Caja estimada", value: formatPrice(fin.caja), icon: Wallet, color: "text-caribe", hint: "Efectivo disponible" },
    { label: "Capital en inventario", value: formatPrice(fin.capital), icon: Boxes, color: "text-chocolate", hint: "Stock × costo" },
    { label: "Si vendo todo", value: formatPrice(fin.valorVenta), icon: Coins, color: "text-gold-deep", hint: "Stock × precio de venta" },
    { label: "Ganancia potencial", value: formatPrice(fin.ganancia), icon: TrendingUp, color: "text-cactus", hint: "Venta − costo" },
  ];

  const opStats = [
    { label: "Productos", value: productos.length, icon: Package, color: "text-caribe" },
    { label: "Unidades en stock", value: unidadesDisponibles, icon: Boxes, color: "text-cactus" },
    { label: "Pedidos", value: pedidos.length, icon: ShoppingBag, color: "text-flamenco" },
    { label: "Ventas pagadas", value: formatPrice(fin.ventasPagadas), icon: Coins, color: "text-gold-deep" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-lux font-bold text-3xl text-chocolate">Dashboard</h1>
          <p className="text-sm text-chocolate-light">Resumen financiero de tu tienda Arüvia</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <PushToggle />
          <Link href="/admin/compras/nuevo" className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Nuevo pedido</Link>
          <Link href="/admin/productos/nuevo" className="btn-secondary px-5 py-2.5 text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Producto</Link>
          <Link href="/admin/pos" className="btn-secondary px-5 py-2.5 text-xs uppercase tracking-wider"><Calculator className="w-4 h-4" /> POS</Link>
        </div>
      </div>

      {!configured && (
        <div className="flex items-start gap-3 bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          <AlertTriangle className="w-5 h-5 text-sol flex-shrink-0 mt-0.5" />
          <div>
            <b>Modo demo:</b> Supabase aún no está configurado. Estás viendo datos de ejemplo y los cambios no se guardan.
            Ejecuta el SQL de <code className="bg-cream-dark/40 px-1 rounded">supabase/migration-proveedores-finanzas.sql</code> para activar las nuevas funciones.
          </div>
        </div>
      )}

      {/* Tarjetas financieras */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {finanzas.map((s) => (
          <div key={s.label} className="bg-white border border-cream-dark rounded-2xl p-5">
            <s.icon className={`w-6 h-6 ${s.color}`} />
            <p className="text-xl lg:text-2xl font-black text-chocolate mt-3">{s.value}</p>
            <p className="text-xs text-chocolate font-bold uppercase tracking-wide">{s.label}</p>
            <p className="text-[11px] text-chocolate-light">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Desglose por línea: mochilas vs maquillaje */}
      <div className="grid md:grid-cols-2 gap-4">
        {lineas.map((l) => (
          <Link key={l.linea} href={`/admin/${l.linea}`} className="bg-white border border-cream-dark rounded-2xl p-5 hover:border-caribe transition-colors block">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <l.icon className="w-5 h-5 text-gold-deep" />
                <h2 className="font-title font-extrabold text-chocolate">{l.nombre}</h2>
              </div>
              <span className="text-xs font-bold text-caribe uppercase tracking-wide">Ver línea →</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between"><span className="text-chocolate-light">Productos</span><b className="text-chocolate">{l.productos}</b></div>
              <div className="flex justify-between"><span className="text-chocolate-light">Unidades</span><b className="text-chocolate">{l.unidades}</b></div>
              <div className="flex justify-between"><span className="text-chocolate-light">Capital</span><b className="text-chocolate">{formatPrice(l.capital)}</b></div>
              <div className="flex justify-between"><span className="text-chocolate-light">Si vendo todo</span><b className="text-chocolate">{formatPrice(l.valorVenta)}</b></div>
              <div className="flex justify-between col-span-2 pt-1 border-t border-cream-dark/60"><span className="text-chocolate-light">Ventas pagadas</span><b className="text-cactus">{formatPrice(l.ventas)}</b></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desglose "si vendo todo" */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="font-title font-extrabold text-chocolate">Si vendo todo el inventario</h2>
          <span className="text-2xl font-black text-chocolate">{formatPrice(fin.valorVenta)}</span>
        </div>
        <div className="flex h-5 w-full rounded-full overflow-hidden bg-cream">
          <div className="bg-chocolate/70 h-full" style={{ width: `${pctCapital}%` }} title="Capital" />
          <div className="bg-cactus h-full" style={{ width: `${pctGanancia}%` }} title="Ganancia" />
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-chocolate/70" />
            <span className="text-chocolate-light">Capital (recuperas)</span>
            <span className="font-black text-chocolate">{formatPrice(fin.capital)}</span>
            <span className="text-xs text-chocolate-light">({pctCapital}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cactus" />
            <span className="text-chocolate-light">Ganancia (te queda)</span>
            <span className="font-black text-cactus">{formatPrice(fin.ganancia)}</span>
            <span className="text-xs text-chocolate-light">({pctGanancia}%)</span>
          </div>
        </div>
      </div>

      {/* Panel de caja: inversión, gastos, ingresos, historial */}
      <FinancePanel movimientos={movimientos} />

      {/* Detalle de caja */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Inversiones", v: formatPrice(fin.inversiones), c: "text-caribe" },
          { l: "Compras a proveedor", v: `− ${formatPrice(fin.comprasInventario)}`, c: "text-chocolate" },
          { l: "Gastos operativos", v: `− ${formatPrice(fin.gastos)}`, c: "text-flamenco" },
          { l: "Patrimonio (caja + capital)", v: formatPrice(fin.patrimonio), c: "text-cactus" },
        ].map((s) => (
          <div key={s.l} className="bg-white border border-cream-dark rounded-2xl p-4">
            <p className="text-[11px] text-chocolate-light font-bold uppercase tracking-wide">{s.l}</p>
            <p className={`text-lg font-black mt-1 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Stats operativas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {opStats.map((s) => (
          <div key={s.label} className="bg-white border border-cream-dark rounded-2xl p-5">
            <s.icon className={`w-6 h-6 ${s.color}`} />
            <p className="text-2xl font-black text-chocolate mt-3">{s.value}</p>
            <p className="text-xs text-chocolate-light font-bold uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pedidos recientes */}
        <div className="bg-white border border-cream-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-title font-extrabold text-chocolate">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-xs font-bold text-caribe uppercase tracking-wide">Ver todos</Link>
          </div>
          {recientes.length === 0 ? (
            <p className="text-sm text-chocolate-light py-6 text-center">Aún no hay pedidos.</p>
          ) : (
            <div className="space-y-2">
              {recientes.map((o) => (
                <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-cream transition-colors">
                  <div>
                    <p className="text-sm font-bold text-chocolate">{o.id}</p>
                    <p className="text-xs text-chocolate-light">{o.cliente_nombre || "—"} · {o.channel === "pos" ? "POS" : "Online"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-chocolate">{formatPrice(o.total)}</p>
                    <span className="text-[10px] font-bold uppercase text-chocolate-light">{o.estado}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="bg-white border border-cream-dark rounded-2xl p-5">
          <h2 className="font-title font-extrabold text-chocolate mb-4">Stock bajo / última pieza</h2>
          {stockBajo.length === 0 ? (
            <p className="text-sm text-chocolate-light py-6 text-center">Todo en orden.</p>
          ) : (
            <div className="space-y-2">
              {stockBajo.map((p) => (
                <Link key={p.id} href={`/admin/productos/${p.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-cream transition-colors">
                  <span className="text-sm font-bold text-chocolate truncate pr-2">{p.nombre}</span>
                  <span className="text-xs font-black text-flamenco whitespace-nowrap">{p.stock} u.</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
