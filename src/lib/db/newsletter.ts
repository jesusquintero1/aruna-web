import "server-only";
import { getSupabase } from "@/lib/supabase/server";

export interface SubscribeResult {
  ok: boolean;
  already?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normaliza un email para guardarlo (minúsculas, sin espacios). */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  const e = normalizeEmail(raw);
  return e.length <= 160 && EMAIL_RE.test(e);
}

/**
 * Suscribe un correo al newsletter. Idempotente: si el correo ya existe,
 * devuelve { ok: true, already: true } sin crear duplicado.
 * Sin DB configurada (modo demo): devuelve { ok: true } sin persistir.
 */
export async function subscribeEmail(
  emailRaw: string,
  fuente: string,
  consent: boolean
): Promise<SubscribeResult> {
  if (!consent) return { ok: false };
  const email = normalizeEmail(emailRaw);
  if (!isValidEmail(email)) return { ok: false };

  const db = getSupabase();
  if (!db) return { ok: true }; // modo demo: no se persiste, pero no rompe el form

  const { error } = await db
    .from("newsletter_subscribers")
    .insert({ email, fuente: fuente === "blog" ? "blog" : "footer", consent: true });

  if (error) {
    // 23505 = unique_violation → el correo ya estaba suscrito.
    if (error.code === "23505" || /duplicate key|unique/i.test(error.message)) {
      return { ok: true, already: true };
    }
    console.error("subscribeEmail falló:", error.message);
    return { ok: false };
  }
  return { ok: true };
}
