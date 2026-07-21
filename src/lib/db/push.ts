import "server-only";
import { getSupabase } from "@/lib/supabase/server";

export interface PushSub {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Guarda (o actualiza) una suscripción push de un dispositivo admin. */
export async function savePushSubscription(sub: PushSub): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  await db
    .from("push_subscriptions")
    .upsert({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, { onConflict: "endpoint" });
}

/** Elimina una suscripción (al desactivar o si el navegador la invalidó). */
export async function deletePushSubscription(endpoint: string): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  await db.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

/** Todas las suscripciones activas (para difundir una notificación). */
export async function getPushSubscriptions(): Promise<PushSub[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data, error } = await db.from("push_subscriptions").select("endpoint, p256dh, auth");
  if (error || !data) return [];
  return data as PushSub[];
}
