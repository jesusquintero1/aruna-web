"use server";

import { subscribeEmail, isValidEmail } from "@/lib/db/newsletter";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";

export interface NewsletterState {
  status: "idle" | "ok" | "already" | "error";
  message?: string;
}

/**
 * Server action pública (sin verifySession) para suscribir al newsletter.
 * Exige consentimiento explícito (Habeas Data, Ley 1581). Rate-limit por IP.
 * Compatible con useActionState: (prevState, formData) => nuevoState.
 */
export async function subscribeNewsletterAction(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") || "");
  const consent = formData.get("consent") === "on";
  const fuente = String(formData.get("fuente") || "footer");

  if (!consent) {
    return { status: "error", message: "Debes aceptar la política de privacidad para suscribirte." };
  }
  if (!isValidEmail(email)) {
    return { status: "error", message: "Ingresa un correo válido." };
  }

  const ip = await clientIp();
  const allowed = await rateLimit(`newsletter:ip:${ip}`, 5, 3600, { failOpen: true });
  if (!allowed) {
    return { status: "error", message: "Demasiados intentos. Inténtalo más tarde." };
  }

  const res = await subscribeEmail(email, fuente, consent);
  if (!res.ok) {
    return { status: "error", message: "No pudimos registrar tu correo. Intenta de nuevo." };
  }
  return res.already
    ? { status: "already", message: "Este correo ya estaba suscrito. ¡Gracias!" }
    : { status: "ok", message: "¡Te has suscrito con éxito! Pronto recibirás noticias y leyendas de La Guajira." };
}
