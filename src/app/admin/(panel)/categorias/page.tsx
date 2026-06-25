import { getCategories } from "@/lib/db/categories";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createCategory, deleteCategory } from "@/lib/db/admin-actions";
import { Plus, Trash2, Tags } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCategorias() {
  const categorias = await getCategories();
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-lux font-bold text-3xl text-chocolate">Categorías</h1>
        <p className="text-sm text-chocolate-light">Organiza tus productos por colección</p>
      </div>

      {!configured && (
        <p className="bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          Modo demo: configura Supabase para gestionar categorías reales.
        </p>
      )}

      <form action={createCategory} className="flex gap-2 bg-white border border-cream-dark rounded-2xl p-4">
        <input name="nombre" required placeholder="Nombre de la categoría" className="flex-grow bg-cream border border-cream-dark rounded-xl px-4 py-2.5 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe" />
        <button type="submit" className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Añadir</button>
      </form>

      <div className="bg-white border border-cream-dark rounded-2xl overflow-hidden">
        {categorias.length === 0 ? (
          <p className="text-center text-chocolate-light py-10">No hay categorías.</p>
        ) : (
          <div className="divide-y divide-cream-dark">
            {categorias.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <span className="flex items-center gap-2.5 font-bold text-chocolate">
                  <Tags className="w-4 h-4 text-caribe" /> {c.nombre}
                </span>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="p-2 text-chocolate-light hover:text-flamenco rounded-lg hover:bg-cream" aria-label="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
