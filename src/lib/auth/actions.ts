"use server";

import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";

export interface LoginState {
  error?: string;
}

/**
 * Acción de login para `useActionState`.
 * Valida contra `admin_users` (bcrypt) si hay Supabase; si no, contra
 * ADMIN_USERNAME/ADMIN_PASSWORD del entorno (modo previo a configurar la DB).
 */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Ingresa usuario y contraseña." };
  }

  // Rate limit ANTES de bcrypt (que es caro): por IP y por usuario.
  // fail-closed: si hay DB pero el limiter falla, se bloquea.
  const ip = await clientIp();
  const okIp = await rateLimit(`login:ip:${ip}`, 8, 300, { failOpen: false });
  const okUser = await rateLimit(`login:user:${username.toLowerCase()}`, 5, 300, { failOpen: false });
  if (!okIp || !okUser) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  let ok = false;
  const db = getSupabase();

  if (db) {
    const { data } = await db.from("admin_users").select("password_hash").eq("username", username).maybeSingle();
    if (data?.password_hash) {
      ok = await verifyPassword(password, data.password_hash);
    }
  } else if (process.env.NODE_ENV !== "production") {
    // Fallback SOLO en desarrollo (sin DB): credenciales del entorno o admin/admin.
    // En producción nunca se permite: la autenticación exige Supabase + admin_users.
    const envUser = process.env.ADMIN_USERNAME || "admin";
    const envPass = process.env.ADMIN_PASSWORD || "admin";
    ok = username === envUser && password === envPass;
  }

  if (!ok) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  await createSession({ username });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
