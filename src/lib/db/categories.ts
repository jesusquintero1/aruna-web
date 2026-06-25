import "server-only";
import { getSupabase } from "@/lib/supabase/server";

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
}

/** Categoría de fallback cuando no hay DB (la categoría histórica de la marca). */
const fallbackCategorias: Categoria[] = [
  { id: "fallback-un-hilo", nombre: "Mochila Un Hilo", slug: "mochila-un-hilo", orden: 0 },
];

export async function getCategories(): Promise<Categoria[]> {
  const db = getSupabase();
  if (!db) return fallbackCategorias;
  const { data, error } = await db.from("categories").select("*").order("orden", { ascending: true });
  if (error || !data) return fallbackCategorias;
  return data as Categoria[];
}
