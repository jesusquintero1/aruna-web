/**
 * Crea/actualiza el usuario admin en Supabase con contraseña hasheada (bcrypt).
 * Uso:  npm run seed:admin
 * Requiere SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USERNAME, ADMIN_PASSWORD en .env.local
 */
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!url || !key) {
  console.error("✖ Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
if (!username || !password) {
  console.error("✖ Faltan ADMIN_USERNAME / ADMIN_PASSWORD en .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const password_hash = await bcrypt.hash(password!, 10);
  const { error } = await db
    .from("admin_users")
    .upsert({ username, password_hash }, { onConflict: "username" });
  if (error) throw error;
  console.log(`✅ Admin "${username}" listo. Ya puedes iniciar sesión en /admin/login`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
