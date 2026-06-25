/**
 * Siembra las categorías y los productos iniciales en Supabase.
 * Uso:  npm run seed:products
 * Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 */
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { productos } from "../src/data/productos";

loadEnvConfig(process.cwd());

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("✖ Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  // 1) Categorías derivadas del campo `categoria` actual
  const nombres = Array.from(new Set(productos.map((p) => p.categoria)));
  const categoriaIdPorNombre = new Map<string, string>();

  for (let i = 0; i < nombres.length; i++) {
    const nombre = nombres[i];
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await db
      .from("categories")
      .upsert({ nombre, slug, orden: i }, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw error;
    categoriaIdPorNombre.set(nombre, data.id);
    console.log(`✓ Categoría: ${nombre}`);
  }

  // 2) Productos
  for (const p of productos) {
    const row = {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      precio_anterior: p.precioAnterior ?? null,
      imagenes: p.imagenes,
      colores: p.colores,
      categoria_id: categoriaIdPorNombre.get(p.categoria) ?? null,
      simbolo: p.simbolo,
      destacado: p.destacado,
      stock: p.disponible ? 1 : 0,
    };
    const { error } = await db.from("products").upsert(row, { onConflict: "id" });
    if (error) throw error;
    console.log(`✓ Producto: ${p.nombre}`);
  }

  console.log("\n✅ Seed completado.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
