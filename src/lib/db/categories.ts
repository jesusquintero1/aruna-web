import "server-only";
import { getSupabase } from "@/lib/supabase/server";

import type { LineaProducto } from "@/data/productos";

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  linea: LineaProducto;
}

/** Categoría de fallback cuando no hay DB (la categoría histórica de la marca). */
const fallbackCategorias: Categoria[] = [
  { id: "fallback-un-hilo", nombre: "Mochila Un Hilo", slug: "mochila-un-hilo", orden: 0, linea: "mochilas" },
];

export async function getCategories(linea?: LineaProducto): Promise<Categoria[]> {
  const db = getSupabase();
  if (!db) return linea ? fallbackCategorias.filter((c) => c.linea === linea) : fallbackCategorias;
  let q = db.from("categories").select("*");
  if (linea) q = q.eq("linea", linea);
  const { data, error } = await q.order("orden", { ascending: true });
  if (error || !data) return [];
  return (data as Array<Omit<Categoria, "linea"> & { linea: LineaProducto | null }>).map((c) => ({
    ...c,
    linea: c.linea ?? "mochilas",
  }));
}
