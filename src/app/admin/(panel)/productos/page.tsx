import Link from "next/link";
import Image from "next/image";
import { getProductsAdmin } from "@/lib/db/products";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "@/lib/db/admin-actions";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductos() {
  const productos = await getProductsAdmin();
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-lux font-bold text-3xl text-chocolate">Productos</h1>
          <p className="text-sm text-chocolate-light">{productos.length} productos</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Nuevo</Link>
      </div>

      {!configured && (
        <p className="bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          Modo demo: configura Supabase para crear y editar productos de verdad.
        </p>
      )}

      <div className="bg-white border border-cream-dark rounded-2xl overflow-hidden">
        {productos.length === 0 ? (
          <p className="text-center text-chocolate-light py-12">No hay productos.</p>
        ) : (
          <div className="divide-y divide-cream-dark">
            {productos.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-dark/30 flex-shrink-0">
                  <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-chocolate truncate flex items-center gap-1.5">
                    {p.nombre}
                    {p.destacado && <Star className="w-3.5 h-3.5 text-gold-lux fill-current" />}
                  </p>
                  <p className="text-xs text-chocolate-light">{p.categoria} · {formatPrice(p.precio)}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className={`text-xs font-black ${p.stock > 0 ? "text-cactus" : "text-flamenco"}`}>
                    {p.stock > 0 ? `${p.stock} en stock` : "Agotado"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/productos/${p.id}`} className="p-2 text-chocolate-light hover:text-caribe rounded-lg hover:bg-cream" aria-label="Editar">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="p-2 text-chocolate-light hover:text-flamenco rounded-lg hover:bg-cream" aria-label="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
