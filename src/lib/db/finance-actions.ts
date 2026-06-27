"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/session";
import type { MovimientoTipo } from "@/lib/db/finance";

const TIPOS: MovimientoTipo[] = ["inversion", "gasto", "ingreso"];

/** Registra un movimiento financiero (inversión, gasto o ingreso). */
export async function createMovementAction(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");

  const tipoRaw = String(formData.get("tipo") || "");
  const tipo = (TIPOS.includes(tipoRaw as MovimientoTipo) ? tipoRaw : "gasto") as MovimientoTipo;
  const asunto = String(formData.get("asunto") || "").trim();
  const descripcion = String(formData.get("descripcion") || "").trim() || null;
  const monto = parseInt(String(formData.get("monto") || "0"), 10) || 0;
  const fecha = String(formData.get("fecha") || "").trim() || null;

  if (!asunto) throw new Error("El asunto es obligatorio.");
  if (monto <= 0) throw new Error("El monto debe ser mayor a cero.");

  const { error } = await db.from("finance_movements").insert({
    tipo, asunto, descripcion, monto, ...(fecha ? { fecha } : {}),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteMovementAction(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");
  const id = String(formData.get("id") || "");
  if (id) await db.from("finance_movements").delete().eq("id", id);
  revalidatePath("/admin");
}
