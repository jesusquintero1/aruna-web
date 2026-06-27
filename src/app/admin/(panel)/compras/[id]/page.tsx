import Link from "next/link";
import { notFound } from "next/navigation";
import { getPurchaseOrderById } from "@/lib/db/purchases";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PedidoProveedorDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPurchaseOrderById(id);
  if (!p) notFound();

  const items = p.purchase_items ?? [];
  const costoItems = items.reduce((s, i) => s + i.cantidad * i.costo_unitario, 0);
  const ventaItems = items.reduce((s, i) => s + i.cantidad * i.precio_venta, 0);
  const unidades = items.reduce((s, i) => s + i.cantidad, 0);
  const costoTotal = costoItems + (p.costo_envio ?? 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/compras" className="inline-flex items-center gap-2 text-sm font-bold text-chocolate-light hover:text-caribe">
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos
      </Link>

      <div>
        <h1 className="font-lux font-bold text-3xl text-chocolate">{p.id}</h1>
        <p className="text-sm text-chocolate-light">{p.proveedor || "Sin proveedor"} · {p.fecha}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { l: "Unidades", v: String(unidades) },
          { l: "Costo mercancía", v: formatPrice(costoItems) },
          { l: "Envío", v: formatPrice(p.costo_envio ?? 0) },
          { l: "Costo total", v: formatPrice(costoTotal) },
        ].map((s) => (
          <div key={s.l} className="bg-white border border-cream-dark rounded-2xl p-4">
            <p className="text-xs text-chocolate-light font-bold uppercase tracking-wide">{s.l}</p>
            <p className="text-lg font-black text-chocolate mt-1">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-cream-dark rounded-2xl p-5">
        <h2 className="font-title font-extrabold text-chocolate mb-3">Referencias</h2>
        <div className="divide-y divide-cream-dark">
          {items.map((it) => (
            <div key={it.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
              <span className="text-chocolate font-semibold">
                {it.cantidad}× {it.products?.nombre || it.product_id || "—"}
                {it.referencia ? <span className="text-chocolate-light"> · {it.referencia}</span> : null}
              </span>
              <span className="text-xs text-chocolate-light">
                costo {formatPrice(it.costo_unitario)} · venta {formatPrice(it.precio_venta)}
              </span>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-chocolate-light py-2">Sin referencias.</p>}
        </div>
        <div className="flex justify-between border-t border-cream-dark pt-3 mt-3 text-sm">
          <span className="font-bold text-chocolate">Venta potencial total</span>
          <span className="font-black text-cactus">{formatPrice(ventaItems)}</span>
        </div>
      </div>

      {p.notas && (
        <div className="bg-white border border-cream-dark rounded-2xl p-5">
          <h2 className="font-title font-extrabold text-chocolate mb-2">Notas</h2>
          <p className="text-sm text-chocolate-light">{p.notas}</p>
        </div>
      )}
    </div>
  );
}
