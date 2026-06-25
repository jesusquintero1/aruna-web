import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db/orders";
import { changeOrderStatus } from "@/lib/db/pos-actions";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, User, Phone, Mail, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

const estados = ["pendiente", "pagado", "enviado", "cancelado"];

export default async function PedidoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOrderById(id);
  if (!o) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-sm font-bold text-chocolate-light hover:text-caribe">
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-lux font-bold text-3xl text-chocolate">{o.id}</h1>
          <p className="text-sm text-chocolate-light">
            {o.channel === "pos" ? "Venta POS" : "Pedido online"} · {new Date(o.created_at).toLocaleString("es-CO")}
          </p>
        </div>
        <form action={changeOrderStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={o.id} />
          <select name="estado" defaultValue={o.estado} className="bg-white border border-cream-dark rounded-xl px-3 py-2 text-sm font-bold text-chocolate focus:outline-none focus:border-caribe">
            {estados.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <button type="submit" className="btn-secondary px-4 py-2 text-xs uppercase tracking-wider">Actualizar</button>
        </form>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Cliente */}
        <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-3">
          <h2 className="font-title font-extrabold text-chocolate">Cliente</h2>
          <p className="flex items-center gap-2 text-sm text-chocolate"><User className="w-4 h-4 text-caribe" /> {o.cliente_nombre || "—"}</p>
          <p className="flex items-center gap-2 text-sm text-chocolate"><Phone className="w-4 h-4 text-caribe" /> {o.cliente_telefono || "—"}</p>
          <p className="flex items-center gap-2 text-sm text-chocolate"><Mail className="w-4 h-4 text-caribe" /> {o.cliente_email || "—"}</p>
          <p className="flex items-start gap-2 text-sm text-chocolate"><MapPin className="w-4 h-4 text-caribe flex-shrink-0 mt-0.5" /> {[o.cliente_direccion, o.cliente_ciudad].filter(Boolean).join(", ") || "—"}</p>
        </div>

        {/* Pago */}
        <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-2">
          <h2 className="font-title font-extrabold text-chocolate mb-2">Pago</h2>
          <div className="flex justify-between text-sm text-chocolate-light"><span>Método</span><span className="font-bold text-chocolate">{o.metodo_pago || "—"}</span></div>
          <div className="flex justify-between text-sm text-chocolate-light"><span>Estado</span><span className="font-bold text-chocolate uppercase">{o.estado}</span></div>
          <div className="flex justify-between text-lg font-black text-chocolate border-t border-cream-dark pt-2 mt-2"><span>Total</span><span className="text-flamenco">{formatPrice(o.total)}</span></div>
        </div>
      </div>

      {/* Ítems */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5">
        <h2 className="font-title font-extrabold text-chocolate mb-3">Productos</h2>
        <div className="divide-y divide-cream-dark">
          {(o.order_items || []).map((it, i) => (
            <div key={i} className="flex justify-between py-2.5 text-sm">
              <span className="text-chocolate">{it.cantidad}× {it.nombre_snapshot}</span>
              <span className="font-bold text-chocolate">{formatPrice(it.subtotal)}</span>
            </div>
          ))}
          {(!o.order_items || o.order_items.length === 0) && (
            <p className="text-sm text-chocolate-light py-2">Sin detalle de ítems.</p>
          )}
        </div>
      </div>

      {o.notas && (
        <div className="bg-white border border-cream-dark rounded-2xl p-5">
          <h2 className="font-title font-extrabold text-chocolate mb-2">Notas</h2>
          <p className="text-sm text-chocolate-light">{o.notas}</p>
        </div>
      )}
    </div>
  );
}
