import Link from "next/link";
import { getProductsAdmin } from "@/lib/db/products";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import ProductosListClient from "@/components/admin/ProductosListClient";
import { Plus } from "lucide-react";

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

      <ProductosListClient productos={productos} />
    </div>
  );
}
