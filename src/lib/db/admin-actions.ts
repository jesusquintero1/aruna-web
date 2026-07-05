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

/** Solo aceptamos como video URLs públicas de nuestro propio Storage. */
function esUrlDeStorage(url: string): boolean {
  const base = process.env.SUPABASE_URL;
  return Boolean(base && url.startsWith(`${base}/storage/v1/object/public/${BUCKET}/`));
}

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/maquillaje");
  revalidatePath("/admin/productos");
}

// ============================================================
// PRODUCTOS
// ============================================================
export type SaveProductState = { error: string } | undefined;

export async function saveProduct(_prev: SaveProductState, formData: FormData): Promise<SaveProductState> {
  await verifySession();
  const db = getSupabase();
  if (!db) return { error: "Supabase no está configurado. No se puede guardar." };

  const editingId = String(formData.get("id") || "").trim();
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) return { error: "El nombre es obligatorio." };

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
  const linea = String(formData.get("linea") || "mochilas");
  const publicado = formData.get("publicado") === "on";
  const categoria_id = String(formData.get("categoria_id") || "") || null;
  const descripcion = String(formData.get("descripcion") || "");

  // Validación de forma y topes (precios/stock/símbolo/línea).
  const v = productSchema.safeParse({ nombre, precio, costo, precio_anterior, stock, simbolo, linea });
  if (!v.success) {
    return { error: v.error.issues[0]?.message || "Datos del producto inválidos." };
  }

  // Imágenes existentes que se conservan + nuevas subidas
  const keep = formData.getAll("keep_imagenes").map(String).filter(Boolean);
  const files = formData.getAll("imagenes").filter((f): f is File => f instanceof File);
  let nuevas: string[];
  try {
    nuevas = await uploadImages(db, id, files);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al subir las imágenes." };
  }
  const imagenes = [...keep, ...nuevas];

  // Videos: los que se conservan + los ya subidos directo a Storage por el
  // navegador (el form solo envía sus URLs — ver createVideoUploadUrl).
  const keepVideos = formData.getAll("keep_videos").map(String).filter(Boolean);
  const nuevosVideos = formData.getAll("videos_urls").map(String).filter(esUrlDeStorage);
  const videos = [...keepVideos, ...nuevosVideos];

  const row = {
    id, nombre, descripcion, precio, costo, precio_anterior,
    imagenes, videos, colores, categoria_id, simbolo, destacado, stock,
    linea, publicado,
  };

  const { error } = await db.from("products").upsert(row, { onConflict: "id" });
  if (error) return { error: error.message };

  revalidateStore();
  redirect("/admin/productos");
}

/** Publica o despublica un producto (botón en la lista del admin). */
export async function togglePublicado(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) return;
  const id = String(formData.get("id") || "");
  const publicar = formData.get("publicar") === "1";
  if (!id) return;
  await db.from("products").update({ publicado: publicar }).eq("id", id);
  revalidateStore();
}

/**
 * URL firmada para subir un video directo del navegador a Storage.
 * Los videos pesan más que el tope de request de Netlify (~6 MB), así que NO
 * pueden viajar dentro de la Server Action: el navegador hace PUT a esta URL
 * firmada y el form solo envía la URL pública resultante.
 */
export async function createVideoUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string } | { error: string }> {
  await verifySession();
  const db = getSupabase();
  if (!db) return { error: "Supabase no está configurado." };

  const tiposPermitidos = ["video/mp4", "video/webm", "video/quicktime"];
  if (!tiposPermitidos.includes(contentType)) {
    return { error: "Formato de video no soportado. Usa MP4, WebM o MOV." };
  }
  const ext = (filename.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  const path = `videos/${crypto.randomUUID()}.${ext || "mp4"}`;

  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "No se pudo preparar la subida: " + (error?.message ?? "desconocido") };

  const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);
  return { uploadUrl: data.signedUrl, publicUrl: pub.publicUrl };
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
  const linea = formData.get("linea") === "maquillaje" ? "maquillaje" : "mochilas";
  const slug = slugify(nombre);
  await db.from("categories").upsert({ nombre, slug, orden: 0, linea }, { onConflict: "slug" });
  revalidatePath("/admin/categorias");
}

export async function updateCategory(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");
  const id = String(formData.get("id") || "").trim();
  const nombre = String(formData.get("nombre") || "").trim();
  if (!id || !nombre) return;
  const orden = parseInt(String(formData.get("orden") || "0"), 10) || 0;
  const linea = formData.get("linea") === "maquillaje" ? "maquillaje" : "mochilas";
  await db.from("categories").update({ nombre, slug: slugify(nombre), orden, linea }).eq("id", id);
  revalidatePath("/admin/categorias");
  revalidateStore();
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await verifySession();
  const db = getSupabase();
  if (!db) throw new Error("Supabase no está configurado.");
  const id = String(formData.get("id") || "");
  await db.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}

// ============================================================
// CONTENIDO DEL SITIO (infografías al pie del catálogo)
// ============================================================
export type SaveInfografiaState = { error?: string; ok?: boolean } | undefined;

/** Sube/actualiza (o quita) la infografía de una línea (guía de tallas, etc.). */
export async function saveInfografia(_prev: SaveInfografiaState, formData: FormData): Promise<SaveInfografiaState> {
  await verifySession();
  const db = getSupabase();
  if (!db) return { error: "Supabase no está configurado." };

  const linea = formData.get("linea") === "maquillaje" ? "maquillaje" : "mochilas";
  const key = `infografia_${linea}`;

  if (formData.get("quitar") === "1") {
    const { error } = await db.from("site_settings").upsert({ key, value: null, updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
  } else {
    const file = formData.get("imagen");
    if (!(file instanceof File) || file.size === 0) return { error: "Selecciona una imagen." };
    let urls: string[];
    try {
      urls = await uploadImages(db, `infografias-${linea}`, [file]);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Error al subir la imagen." };
    }
    const { error } = await db.from("site_settings").upsert({ key, value: urls[0], updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
  }

  revalidatePath("/catalogo");
  revalidatePath("/maquillaje");
  revalidatePath("/admin/contenido");
  return { ok: true };
}
