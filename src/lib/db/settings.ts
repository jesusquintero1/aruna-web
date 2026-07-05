import "server-only";
import { getSupabase } from "@/lib/supabase/server";

/**
 * Ajustes de contenido del sitio (tabla site_settings, clave → valor).
 * Hoy se usa para las infografías al pie del catálogo de cada línea:
 *   infografia_mochilas   → URL de la guía de tallas de mochilas
 *   infografia_maquillaje → URL de la infografía de maquillaje
 */
export async function getSetting(key: string): Promise<string | null> {
  const db = getSupabase();
  if (!db) return null;
  const { data, error } = await db.from("site_settings").select("value").eq("key", key).maybeSingle();
  if (error || !data) return null;
  return (data.value as string | null) ?? null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = Object.fromEntries(keys.map((k) => [k, null]));
  const db = getSupabase();
  if (!db) return out;
  const { data, error } = await db.from("site_settings").select("key, value").in("key", keys);
  if (error || !data) return out;
  for (const row of data as Array<{ key: string; value: string | null }>) out[row.key] = row.value;
  return out;
}
