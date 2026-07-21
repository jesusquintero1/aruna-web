import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { savePushSubscription, deletePushSubscription } from "@/lib/db/push";

/**
 * Registra/quita la suscripción push de un dispositivo admin. Protegido:
 * solo con sesión de admin (las notificaciones de pedidos son para el dueño).
 */
const subscribeSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(300),
    auth: z.string().min(1).max(300),
  }),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });

  await savePushSubscription({
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const endpoint = (raw as { endpoint?: string } | null)?.endpoint;
  if (endpoint) await deletePushSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
