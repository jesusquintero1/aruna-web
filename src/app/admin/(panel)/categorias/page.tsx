import { getCategories } from "@/lib/db/categories";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createCategory } from "@/lib/db/admin-actions";
import CategoriaRow from "@/components/admin/CategoriaRow";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCategorias() {
  const categorias = await getCategories();
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-lux font-bold text-3xl text-chocolate">Categorías</h1>
        <p className="text-sm text-chocolate-light">Organiza tus productos por colección. Edita el nombre o el orden (menor aparece primero).</p>
      </div>

      {!configured && (
        <p className="bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          Modo demo: configura Supabase para gestionar categorías reales.
        </p>
      )}

      <form action={createCategory} className="flex flex-wrap gap-2 bg-white border border-cream-dark rounded-2xl p-4">
        <input name="nombre" required placeholder="Nombre de la categoría" className="flex-grow bg-cream border border-cream-dark rounded-xl px-4 py-2.5 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe" />
        <select name="linea" className="bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe">
          <option value="mochilas">Mochilas</option>
          <option value="maquillaje">Maquillaje</option>
        </select>
        <button type="submit" className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Añadir</button>
      </form>

      <div className="bg-white border border-cream-dark rounded-2xl overflow-hidden">
        {categorias.length === 0 ? (
          <p className="text-center text-chocolate-light py-10">No hay categorías.</p>
        ) : (
          <div className="divide-y divide-cream-dark">
            {categorias.map((c) => (
              <CategoriaRow key={c.id} categoria={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
