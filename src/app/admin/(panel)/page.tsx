import Link from "next/link";
import { getProductsAdmin } from "@/lib/db/products";
import { getOrders } from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, TrendingUp, AlertTriangle, Plus, Calculator } from "lucide-react";

export default async function AdminDashboard() {
  const [productos, pedidos] = await Promise.all([getProductsAdmin(), getOrders()]);
  const configured = isSupabaseConfigured();

  const disponibles = productos.filter((p) => p.stock > 0).length;
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock <= 1);
  const ingresos = pedidos.filter((o) => o.estado === "pagado").reduce((s, o) => s + o.total, 0);
  const recientes = pedidos.slice(0, 5);

  const stats = [
    { label: "Productos", value: productos.length, icon: Package, color: "text-caribe" },
    { label: "Disponibles", value: disponibles, icon: TrendingUp, color: "text-cactus" },
    { label: "Pedidos", value: pedidos.length, icon: ShoppingBag, color: "text-flamenco" },
    { label: "Ingresos (pagados)", value: formatPrice(ingresos), icon: TrendingUp, color: "text-gold-deep" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-lux font-bold text-3xl text-chocolate">Dashboard</h1>
          <p className="text-sm text-chocolate-light">Resumen de tu tienda Aruna</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/productos/nuevo" className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Nuevo producto</Link>
          <Link href="/admin/pos" className="btn-secondary px-5 py-2.5 text-xs uppercase tracking-wider"><Calculator className="w-4 h-4" /> POS</Link>
        </div>
      </div>

      {!configured && (
        <div className="flex items-start gap-3 bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          <AlertTriangle className="w-5 h-5 text-sol flex-shrink-0 mt-0.5" />
          <div>
            <b>Modo demo:</b> Supabase aún no está configurado. Estás viendo datos de ejemplo y los cambios no se guardan.
            Configura <code className="bg-cream-dark/40 px-1 rounded">.env.local</code> y ejecuta el SQL de <code className="bg-cream-dark/40 px-1 rounded">supabase/schema.sql</code> para activar la persistencia.
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
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
