"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation/schemas";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const BUCKET = "product-images";

/** Sube los archivos de imagen a Storage y devuelve sus URLs públicas. */
async function uploadImages(db: NonNullable<ReturnType<typeof getSupabase>>, productId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (error) throw new Error("Error al subir imagen: " + error.message);
    const { data } = db.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}

// ============================================================
// PRODUCTOS
// ============================================================
export async function saveProduct(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado. No se puede guardar.");

  const editingId = String(formData.get("id") || "").trim();
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) throw new Error("El nombre es obligatorio.");

  const id = editingId || `${slugify(nombre)}-${Math.random().toString(36).slice(2, 6)}`;

  const colores = String(formData.get("colores") || "")
    .split(",").map((c) => c.trim()).filter(Boolean);
  const precio = parseInt(String(formData.get("precio") || "0"), 10) || 0;
  const costo = parseInt(String(formData.get("costo") || "0"), 10) || 0;
  const precioAnteriorRaw = String(formData.get("precioAnterior") || "").trim();
  const precio_anterior = precioAnteriorRaw ? parseInt(precioAnteriorRaw, 10) : null;
  const stock = parseInt(String(formData.get("stock") || "0"), 10) || 0;
  const destacado = formData.get("destacado") === "on";
  const simbolo = String(formData.get("simbolo") || "cardenal");
  const categoria_id = String(formData.get("categoria_id") || "") || null;
  const descripcion = String(formData.get("descripcion") || "");

  // Validación de forma y topes (precios/stock/símbolo).
  const v = productSchema.safeParse({ nombre, precio, costo, precio_anterior, stock, simbolo });
  if (!v.success) {
    const msg = v.error.issues[0]?.message || "Datos del producto inválidos.";
    throw new Error(msg);
  }

  // Imágenes existentes que se conservan + nuevas subidas
  const keep = formData.getAll("keep_imagenes").map(String).filter(Boolean);
  const files = formData.getAll("imagenes").filter((f): f is File => f instanceof File);
  const nuevas = await uploadImages(db, id, files);
  const imagenes = [...keep, ...nuevas];

  const row = {
    id, nombre, descripcion, precio, costo, precio_anterior,
    imagenes, colores, categoria_id, simbolo, destacado, stock,
  };

  const { error } = await db.from("products").upsert(row, { onConflict: "id" });
  if (error) throw new Error(error.message);

  revalidateStore();
  redirect("/admin/productos");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");
  const id = String(formData.get("id") || "");
  await db.from("products").delete().eq("id", id);
  revalidateStore();
  redirect("/admin/productos");
}

// ============================================================
// CATEGORÍAS
// ============================================================
export async function createCategory(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) return;
  const slug = slugify(nombre);
  await db.from("categories").upsert({ nombre, slug, orden: 0 }, { onConflict: "slug" });
  revalidatePath("/admin/categorias");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");
  const id = String(formData.get("id") || "");
  await db.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}
