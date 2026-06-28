import "server-only";
import { headers } from "next/headers";
import { getSupabase } from "@/lib/supabase/server";

/**
 * Rate limiting basado en Postgres (RPC `rate_limit_hit`, ver
 * supabase/migration-rate-limit.sql). Sin servicios externos.
 *
 * Devuelve `true` si la petición está PERMITIDA, `false` si excede el límite.
 *
 * Política de fallo (configurable por llamada):
 *   - failOpen = true  → si no hay DB o el RPC falla, se PERMITE (no bloquear
 *     ventas por un hipo de infraestructura). Úsalo en /api/orders.
 *   - failOpen = false → si hay DB pero el RPC falla, se BLOQUEA (más seguro).
 *     Úsalo en login. Si no hay DB configurada, igual se permite (modo demo).
 */
export async function rateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
  { failOpen = true }: { failOpen?: boolean } = {}
): Promise<boolean> {
  const db = getSupabase();
  if (!db) return true; // sin DB (modo demo): no se aplica el límite

  try {
    const { data, error } = await db.rpc("rate_limit_hit", {
      p_bucket: bucket,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) return failOpen;
    return data === true;
  } catch {
    return failOpen;
  }
}

/**
 * IP del cliente. Prioriza la cabecera de Netlify (no falsificable por el
 * cliente); cae a x-forwarded-for tomando el primer segmento.
 * Acepta un objeto Headers (route handler) o usa headers() de Next (server action).
 */
export async function clientIp(h?: Headers): Promise<string> {
  const hdrs = h ?? (await headers());
  const nf = hdrs.get("x-nf-client-connection-ip");
  if (nf) return nf.trim();
  const xff = hdrs.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
