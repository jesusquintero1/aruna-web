import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { expirePendingOrders } from "@/lib/db/orders";
import { revalidatePath } from "next/cache";

/**
 * Disparo manual/externo de la expiración de carritos abandonados.
 * Cancela y repone el stock de los pedidos ONLINE 'pendiente' más viejos que
 * `minutes` (default 60). La expiración automática la hace pg_cron dentro de
 * Supabase (ver supabase/migration-expire-carritos.sql); este endpoint sirve para:
 *   - un cron externo (cron-job.org, Netlify Scheduled, etc.) si no se usa pg_cron,
 *   - dispararla a mano para probar.
 *
 * Protegido por CRON_SECRET: requiere `Authorization: Bearer <CRON_SECRET>`
 * o el header `x-cron-secret`. Si CRON_SECRET no está configurado, el endpoint
 * queda deshabilitado (fail-closed) para no exponer una acción de escritura.
 *
 * Uso:  curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
 *         "https://aruna-wayuu.netlify.app/api/cron/expire-orders?minutes=60"
 */
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // Sin secreto configurado: deshabilitado.

  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    req.headers.get("x-cron-secret") ||
    "";

  // Comparación de tiempo constante (evita timing attacks); exige misma longitud.
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function handle(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron deshabilitado (falta CRON_SECRET)." }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const raw = Number(req.nextUrl.searchParams.get("minutes"));
  const minutes = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 10080) : 60;

  const expired = await expirePendingOrders(minutes);
  if (expired > 0) {
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
  }
  return NextResponse.json({ expired, minutes });
}

export async function POST(req: NextRequest) {
  return handle(req);
}

// Algunos cron externos solo hacen GET.
export async function GET(req: NextRequest) {
  return handle(req);
}
