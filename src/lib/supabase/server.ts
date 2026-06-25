import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE (solo servidor — nunca importar desde
 * un componente cliente). Omite RLS, así que jamás debe exponerse al navegador.
 */
let cached: SupabaseClient | null = null;

/** ¿Están configuradas las credenciales de Supabase? Si no, la app usa el fallback hardcodeado. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Devuelve el cliente Supabase o null si no está configurado. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  return cached;
}
