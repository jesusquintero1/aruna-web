import Link from "next/link";
import Image from "next/image";
import { getProductsAdmin } from "@/lib/db/products";
import { getVentasPagadasPorLinea } from "@/lib/db/finance";
import { formatPrice } from "@/lib/utils";
import type { LineaProducto } from "@/data/productos";
import { Package, Boxes, Coins, TrendingUp, Plus, Eye, EyeOff } from "lucide-react";

const NOMBRES: Record<LineaProducto, string> = {
  mochilas: "Mochilas Wayuu",
  maquillaje: "Maquillaje",
};

/**
 * Dashboard de una línea de producto: inventario, valor, ventas y stock bajo,
 * solo con los productos de esa línea. Se usa en /admin/mochilas y /admin/maquillaje.
 */
export default async function LineaDashboard({ linea }: { linea: LineaProducto }) {
  const [productos, ventasPorLinea] = await Promise.all([
    getProductsAdmin(linea),
    getVentasPagadasPorLinea(),
  ]);

  const unidades = productos.reduce((s, p) => s + Math.max(0, p.stock), 0);
  const capital = productos.reduce((s, p) => s + Math.max(0, p.stock) * p.costo, 0);
  const valorVenta = productos.reduce((s, p) => s + Math.max(0, p.stock) * p.precio, 0);
  const ganancia = valorVenta - capital;
  const ventas = ventasPorLinea[linea];
  const borradores = productos.filter((p) => !p.publicado);
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock <= 1);
  const agotados = productos.filter((p) => p.stock <= 0);

  const stats = [
    { label: "Productos", value: String(productos.length), icon: Package, color: "text-caribe", hint: `${borradores.length} en borrador` },
    { label: "Unidades en stock", value: String(unidades), icon: Boxes, color: "text-cactus", hint: `${agotados.length} referencias agotadas` },
    { label: "Capital en inventario", value: formatPrice(capital), icon: Coins, color: "text-chocolate", hint: "Stock × costo" },
    { label: "Ganancia potencial", value: formatPrice(ganancia), icon: TrendingUp, color: "text-gold-deep", hint: `Si vendes todo: ${formatPrice(valorVenta)}` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-lux font-bold text-3xl text-chocolate">{NOMBRES[linea]}</h1>
          <p className="text-sm text-chocolate-light">Inventario y ventas de la línea</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/productos/nuevo?linea=${linea}`} className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Producto</Link>
          <Link href={`/admin/productos?linea=${linea}`} className="btn-secondary px-5 py-2.5 text-xs uppercase tracking-wider"><Package className="w-4 h-4" /> Ver inventario</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-cream-dark rounded-2xl p-5">
            <s.icon className={`w-6 h-6 ${s.color}`} />
            <p className="text-xl lg:text-2xl font-black text-chocolate mt-3">{s.value}</p>
            <p className="text-xs text-chocolate font-bold uppercase tracking-wide">{s.label}</p>
            <p className="text-[11px] text-chocolate-light">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-cream-dark rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-title font-extrabold text-chocolate">Ventas pagadas de la línea</h2>
          <span className="text-2xl font-black text-cactus">{formatPrice(ventas)}</span>
        </div>
        <p className="text-[11px] text-chocolate-light mt-1">Suma de ítems de pedidos pagados o enviados (online + POS).</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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

        {/* Últimos productos de la línea */}
        <div className="bg-white border border-cream-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-title font-extrabold text-chocolate">Últimos productos</h2>
            <Link href={`/admin/productos?linea=${linea}`} className="text-xs font-bold text-caribe uppercase tracking-wide">Ver todos</Link>
          </div>
          {productos.length === 0 ? (
            <p className="text-sm text-chocolate-light py-6 text-center">Aún no hay productos en esta línea.</p>
          ) : (
            <div className="space-y-2">
              {productos.slice(0, 5).map((p) => (
                <Link key={p.id} href={`/admin/productos/${p.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream transition-colors">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-cream-dark/30 flex-shrink-0">
                    <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="40px" />
                  </div>
                  <span className="text-sm font-bold text-chocolate truncate flex-grow">{p.nombre}</span>
                  {p.publicado ? (
                    <Eye className="w-4 h-4 text-cactus flex-shrink-0" aria-label="Publicado" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-chocolate-light flex-shrink-0" aria-label="Borrador" />
                  )}
                  <span className="text-xs font-black text-chocolate-light whitespace-nowrap">{p.stock} u.</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
