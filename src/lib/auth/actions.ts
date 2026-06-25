"use server";

import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

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

  let ok = false;
  const db = getSupabase();

  if (db) {
    const { data } = await db.from("admin_users").select("password_hash").eq("username", username).maybeSingle();
    if (data?.password_hash) {
      ok = await verifyPassword(password, data.password_hash);
    }
  } else {
    // Fallback sin DB: credenciales del entorno (o admin/admin en local).
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
