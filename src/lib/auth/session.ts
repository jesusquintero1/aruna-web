import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "aruna_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET || "dev-insecure-secret-cambia-esto-en-produccion";
  return new TextEncoder().encode(s);
}

export interface SessionData {
  username: string;
}

/** Crea la sesión y fija la cookie httpOnly. Solo en Server Action / Route Handler. */
export async function createSession(data: SessionData): Promise<void> {
  const token = await new SignJWT({ username: data.username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Lee y verifica la sesión. Devuelve null si no hay sesión válida. (Cacheado por request.) */
export const getSession = cache(async (): Promise<SessionData | null> => {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { username: payload.username as string };
  } catch {
    return null;
  }
});

/** Exige sesión: redirige a /admin/login si no hay. Para usar en el layout protegido. */
export async function verifySession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Cierra la sesión. */
export async function destroySession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}
