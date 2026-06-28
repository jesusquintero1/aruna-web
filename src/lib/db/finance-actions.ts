"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/session";
import { movementSchema } from "@/lib/validation/schemas";

/** Registra un movimiento financiero (inversión, gasto o ingreso). */
export async function createMovementAction(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");

  const tipoRaw = String(formData.get("tipo") || "");
  const v = movementSchema.safeParse({
    tipo: ["inversion", "gasto", "ingreso"].includes(tipoRaw) ? tipoRaw : "gasto",
    asunto: String(formData.get("asunto") || ""),
    descripcion: String(formData.get("descripcion") || "") || null,
    monto: parseInt(String(formData.get("monto") || "0"), 10) || 0,
    fecha: String(formData.get("fecha") || "").trim() || null,
  });
  if (!v.success) {
    const msg = v.error.issues[0]?.message || "Datos del movimiento inválidos.";
    throw new Error(msg);
  }
  const { tipo, asunto, descripcion, monto, fecha } = v.data;

  const { error } = await db.from("finance_movements").insert({
    tipo, asunto, descripcion, monto, ...(fecha ? { fecha } : {}),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

/** Edita un movimiento financiero ya guardado (incluida su fecha). */
export async function updateMovementAction(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Falta el identificador del movimiento.");

  const tipoRaw = String(formData.get("tipo") || "");
  const v = movementSchema.safeParse({
    tipo: ["inversion", "gasto", "ingreso"].includes(tipoRaw) ? tipoRaw : "gasto",
    asunto: String(formData.get("asunto") || ""),
    descripcion: String(formData.get("descripcion") || "") || null,
    monto: parseInt(String(formData.get("monto") || "0"), 10) || 0,
    fecha: String(formData.get("fecha") || "").trim() || null,
  });
  if (!v.success) {
    const msg = v.error.issues[0]?.message || "Datos del movimiento inválidos.";
    throw new Error(msg);
  }
  const { tipo, asunto, descripcion, monto, fecha } = v.data;

  const { error } = await db
    .from("finance_movements")
    .update({ tipo, asunto, descripcion, monto, ...(fecha ? { fecha } : {}) })
    .eq("id", id);
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
