import Link from "next/link";
import { getOrders } from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Store } from "lucide-react";

export const dynamic = "force-dynamic";

const estadoColor: Record<string, string> = {
  pendiente: "bg-sol/20 text-gold-deep",
  pagado: "bg-cactus/15 text-cactus",
  enviado: "bg-caribe/15 text-caribe-deep",
  cancelado: "bg-flamenco/15 text-flamenco",
};

export default async function AdminPedidos() {
  const pedidos = await getOrders();
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-lux font-bold text-3xl text-chocolate">Pedidos</h1>
        <p className="text-sm text-chocolate-light">{pedidos.length} pedidos en total</p>
      </div>

      {!configured && (
        <p className="bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          Modo demo: los pedidos reales aparecerán aquí cuando configures Supabase.
        </p>
      )}

      <div className="bg-white border border-cream-dark rounded-2xl overflow-hidden">
        {pedidos.length === 0 ? (
          <p className="text-center text-chocolate-light py-12">Aún no hay pedidos.</p>
        ) : (
          <div className="divide-y divide-cream-dark">
            {pedidos.map((o) => (
              <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="flex items-center gap-4 p-4 hover:bg-cream transition-colors">
                <div className="p-2.5 rounded-xl bg-cream">
                  {o.channel === "pos" ? <Store className="w-5 h-5 text-flamenco" /> : <ShoppingBag className="w-5 h-5 text-caribe" />}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-chocolate">{o.id}</p>
                  <p className="text-xs text-chocolate-light truncate">
                    {o.cliente_nombre || "Sin nombre"} · {new Date(o.created_at).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full ${estadoColor[o.estado] || "bg-cream-dark/40 text-chocolate"}`}>
                  {o.estado}
                </span>
                <span className="font-black text-chocolate w-24 text-right">{formatPrice(o.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
