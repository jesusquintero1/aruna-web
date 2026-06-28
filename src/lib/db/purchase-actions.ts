"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, type PurchaseItemInput } from "@/lib/db/purchases";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

interface RawItem {
  product_id?: string;
  is_new?: boolean;
  nombre?: string;
  referencia?: string;
  cantidad?: number | string;
  costo_unitario?: number | string;
  precio_venta?: number | string;
  categoria_id?: string | null;
  simbolo?: string;
}

function toInt(v: unknown): number {
  return parseInt(String(v ?? "0"), 10) || 0;
}

/**
 * Crea un pedido de proveedor. El cliente envía en el campo `payload` un JSON:
 * { proveedor, fecha, costoEnvio, notas, items: [...] }
 */
export async function createPurchaseAction(formData: FormData): Promise<void> {
  await verifySession();

  let payload: {
    proveedor?: string;
    fecha?: string;
    costoEnvio?: number | string;
    notas?: string;
    items?: RawItem[];
  };
  try {
    payload = JSON.parse(String(formData.get("payload") || "{}"));
  } catch {
    throw new Error("Datos del pedido inválidos.");
  }

  const items: PurchaseItemInput[] = (payload.items || [])
    .map((it) => {
      const isNew = Boolean(it.is_new) || !it.product_id;
      const nombre = (it.nombre || "").trim();
      const product_id = isNew
        ? `${slugify(nombre) || "mochila"}-${Math.random().toString(36).slice(2, 6)}`
        : String(it.product_id);
      return {
        product_id,
        is_new: isNew,
        nombre: nombre || undefined,
        referencia: (it.referencia || "").trim() || undefined,
        cantidad: toInt(it.cantidad),
        costo_unitario: toInt(it.costo_unitario),
        precio_venta: toInt(it.precio_venta),
        categoria_id: it.categoria_id || null,
        simbolo: it.simbolo || "cardenal",
      } as PurchaseItemInput;
    })
    .filter((it) => it.cantidad > 0 && (!it.is_new || it.nombre));

  if (!items.length) throw new Error("Agrega al menos una referencia con nombre y cantidad.");

  await createPurchaseOrder({
    proveedor: (payload.proveedor || "").trim() || null,
    fecha: payload.fecha || null,
    costoEnvio: toInt(payload.costoEnvio),
    notas: (payload.notas || "").trim() || null,
    items,
  });

  revalidateCompras();
  redirect("/admin/compras");
}

function revalidateCompras(id?: string) {
  revalidatePath("/admin/compras");
  if (id) revalidatePath(`/admin/compras/${id}`);
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalogo");
}

/**
 * Edita un pedido de proveedor existente. Solo opera sobre referencias
 * existentes (las líneas sin producto seleccionado se ignoran). El RPC
 * revierte el stock anterior y reaplica las cantidades/costos nuevos.
 */
export async function updatePurchaseAction(formData: FormData): Promise<void> {
  await verifySession();

  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Falta el identificador del pedido.");

  let payload: {
    proveedor?: string;
    fecha?: string;
    costoEnvio?: number | string;
    notas?: string;
    items?: RawItem[];
  };
  try {
    payload = JSON.parse(String(formData.get("payload") || "{}"));
  } catch {
    throw new Error("Datos del pedido inválidos.");
  }

  const items: PurchaseItemInput[] = (payload.items || [])
    .filter((it) => it.product_id) // edición: solo referencias existentes
    .map((it) => ({
      product_id: String(it.product_id),
      is_new: false,
      referencia: (it.referencia || "").trim() || undefined,
      cantidad: toInt(it.cantidad),
      costo_unitario: toInt(it.costo_unitario),
      precio_venta: toInt(it.precio_venta),
    }))
    .filter((it) => it.cantidad > 0);

  if (!items.length) throw new Error("Agrega al menos una referencia existente con cantidad.");

  await updatePurchaseOrder({
    id,
    proveedor: (payload.proveedor || "").trim() || null,
    fecha: payload.fecha || null,
    costoEnvio: toInt(payload.costoEnvio),
    notas: (payload.notas || "").trim() || null,
    items,
  });

  revalidateCompras(id);
  redirect(`/admin/compras/${id}`);
}

/** Elimina un pedido de proveedor y resta del stock las unidades compradas. */
export async function deletePurchaseAction(formData: FormData): Promise<void> {
  await verifySession();
  const id = String(formData.get("id") || "").trim();
  if (id) await deletePurchaseOrder(id);
  revalidateCompras();
  redirect("/admin/compras");
}
