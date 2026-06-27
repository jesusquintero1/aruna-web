import Link from "next/link";
import { getPurchaseOrders, getInventoryByReference } from "@/lib/db/purchases";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Plus, Truck, Boxes, AlertTriangle } from "lucide-react";

export default async function ComprasPage() {
  const [pedidos, inventario] = await Promise.all([getPurchaseOrders(), getInventoryByReference()]);
  const configured = isSupabaseConfigured();

  const totalDe = (items?: { cantidad: number; costo_unitario: number }[]) =>
    (items ?? []).reduce((s, i) => s + i.cantidad * i.costo_unitario, 0);
  const unidadesDe = (items?: { cantidad: number }[]) =>
    (items ?? []).reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-lux font-bold text-3xl text-chocolate">Pedidos de proveedor</h1>
          <p className="text-sm text-chocolate-light">Compras a proveedores y stock por lote</p>
        </div>
        <Link href="/admin/compras/nuevo" className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4" /> Nuevo pedido
        </Link>
      </div>

      {!configured && (
        <div className="flex items-start gap-3 bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          <AlertTriangle className="w-5 h-5 text-sol flex-shrink-0 mt-0.5" />
          <div><b>Modo demo:</b> configura Supabase para guardar pedidos de proveedor.</div>
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5">
        <h2 className="font-title font-extrabold text-chocolate mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-caribe" /> Pedidos</h2>
        {pedidos.length === 0 ? (
          <p className="text-sm text-chocolate-light py-6 text-center">Aún no has registrado pedidos de proveedor.</p>
        ) : (
          <div className="divide-y divide-cream-dark/60">
            {pedidos.map((p) => (
              <Link key={p.id} href={`/admin/compras/${p.id}`} className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-cream transition-colors">
                <div>
                  <p className="text-sm font-bold text-chocolate">{p.id} · {p.proveedor || "Sin proveedor"}</p>
                  <p className="text-xs text-chocolate-light">{p.fecha} · {(p.purchase_items?.length ?? 0)} referencias · {unidadesDe(p.purchase_items)} u.</p>
                </div>
                <p className="text-sm font-black text-chocolate">{formatPrice(totalDe(p.purchase_items) + (p.costo_envio ?? 0))}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Inventario por referencia (lotes) */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5">
        <h2 className="font-title font-extrabold text-chocolate mb-4 flex items-center gap-2"><Boxes className="w-5 h-5 text-caribe" /> Stock por referencia y lote</h2>
        {inventario.length === 0 ? (
          <p className="text-sm text-chocolate-light py-6 text-center">No hay lotes registrados todavía.</p>
        ) : (
          <div className="space-y-5">
            {inventario.map((ref) => (
              <div key={ref.product_id} className="border border-cream-dark rounded-xl overflow-hidden">
                <div className="flex items-center justify-between bg-cream px-4 py-2.5">
                  <span className="text-sm font-bold text-chocolate truncate pr-2">{ref.nombre}</span>
                  <span className="text-xs font-black text-caribe whitespace-nowrap">{ref.stockActual} u. en stock</span>
                </div>
                <div className="divide-y divide-cream-dark/50">
                  {ref.lotes.map((l, i) => (
                    <div key={`${l.purchase_order_id}-${i}`} className="flex items-center justify-between px-4 py-2 text-xs">
                      <span className="text-chocolate-light">
                        <span className="font-bold text-chocolate">{l.purchase_order_id}</span>
                        {l.proveedor ? ` · ${l.proveedor}` : ""} · {l.fecha}
                      </span>
                      <span className="flex items-center gap-4 text-chocolate-light whitespace-nowrap">
                        <span><b className="text-chocolate">{l.restantes}</b>/{l.cantidad} u.</span>
                        <span>costo {formatPrice(l.costo_unitario)}</span>
                        <span>venta {formatPrice(l.precio_venta)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
