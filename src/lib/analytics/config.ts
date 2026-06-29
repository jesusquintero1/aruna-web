// Configuración de analítica web (cliente). Los IDs son públicos (NEXT_PUBLIC_*)
// e inyectados en build. La analítica es no-op hasta que se definan en Netlify.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "";

/** ¿Hay al menos un proveedor de analítica configurado? */
export function isAnalyticsConfigured(): boolean {
  return Boolean(GA_ID || FB_PIXEL_ID);
}

// ---- Consentimiento de cookies (Habeas Data / política de cookies) ----
export const CONSENT_KEY = "aruna_consent";
export const CONSENT_EVENT = "aruna-consent-change";
export type Consent = "granted" | "denied";

/** Lee la elección guardada; null si el usuario aún no decidió. */
export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

/** Guarda la elección y notifica a los componentes en la misma sesión. */
export function setConsent(value: Consent): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}
