import "server-only";
import { getSupabase } from "@/lib/supabase/server";
import { productos as fallbackProductos, type Producto, type LineaProducto } from "@/data/productos";

export type { LineaProducto };

/** Producto con campos adicionales que solo necesita el admin (stock, costo, categoría id). */
export interface ProductoAdmin extends Producto {
  stock: number;
  costo: number;
  categoriaId: string | null;
  publicado: boolean;
  linea: LineaProducto;
  videos: string[];
}

interface ProductRow {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number | null;
  precio_anterior: number | null;
  imagenes: string[];
  videos: string[] | null;
  colores: string[];
  categoria_id: string | null;
  simbolo: Producto["simbolo"];
  destacado: boolean;
  stock: number;
  linea: LineaProducto;
  publicado: boolean;
  categories: { nombre: string } | null;
}

function mapRow(row: ProductRow): ProductoAdmin {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: row.precio,
    precioAnterior: row.precio_anterior ?? undefined,
    imagenes: row.imagenes?.length ? row.imagenes : ["/images/mochila_cardenal.png"],
    videos: row.videos ?? [],
    descripcion: row.descripcion ?? "",
    colores: row.colores ?? [],
    categoria: row.categories?.nombre ?? "General",
    disponible: row.stock > 0,
    destacado: row.destacado,
    simbolo: row.simbolo,
    stock: row.stock,
    costo: row.costo ?? 0,
    categoriaId: row.categoria_id,
    publicado: row.publicado ?? true,
    linea: row.linea ?? "mochilas",
  };
}

function fallbackAdmin(p: Producto): ProductoAdmin {
  return {
    ...p,
    stock: p.disponible ? 1 : 0,
    costo: 0,
    categoriaId: null,
    publicado: true,
    linea: p.linea ?? "mochilas",
    videos: p.videos ?? [],
  };
}

const SELECT = "*, categories(nombre)";

/**
 * Productos visibles en la tienda (solo publicados), opcionalmente por línea.
 * Fallback al array hardcodeado (todo mochilas) si no hay DB.
 */
export async function getProducts(linea?: LineaProducto): Promise<Producto[]> {
  const db = getSupabase();
  if (!db) return linea === "maquillaje" ? [] : fallbackProductos;
  let q = db.from("products").select(SELECT).eq("publicado", true);
  if (linea) q = q.eq("linea", linea);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error || !data) return linea === "maquillaje" ? [] : fallbackProductos;
  return (data as ProductRow[]).map(mapRow);
}

/** Productos destacados (home). Solo publicados. */
export async function getFeaturedProducts(): Promise<Producto[]> {
  const db = getSupabase();
  if (!db) return fallbackProductos.filter((p) => p.destacado);
  const { data, error } = await db
    .from("products").select(SELECT)
    .eq("destacado", true).eq("publicado", true)
    .order("created_at", { ascending: false });
  if (error || !data) return fallbackProductos.filter((p) => p.destacado);
  return (data as ProductRow[]).map(mapRow);
}

/** Un producto por id (slug). Los borradores no existen para la tienda. */
export async function getProductById(id: string): Promise<Producto | null> {
  const db = getSupabase();
  if (!db) return fallbackProductos.find((p) => p.id === id) ?? null;
  const { data, error } = await db.from("products").select(SELECT).eq("id", id).eq("publicado", true).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as ProductRow);
}

/** Productos relacionados (misma línea, disponibles, excluyendo el actual). */
export async function getRelatedProducts(id: string, linea?: LineaProducto): Promise<Producto[]> {
  const all = await getProducts(linea);
  return all.filter((p) => p.id !== id && p.disponible).slice(0, 4);
}

/** Lista para el admin (incluye stock, categoriaId, borradores), opcionalmente por línea. */
export async function getProductsAdmin(linea?: LineaProducto): Promise<ProductoAdmin[]> {
  const db = getSupabase();
  if (!db) {
    const base = fallbackProductos.map(fallbackAdmin);
    return linea ? base.filter((p) => p.linea === linea) : base;
  }
  let q = db.from("products").select(SELECT);
  if (linea) q = q.eq("linea", linea);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as ProductRow[]).map(mapRow);
}

/** Un producto para el admin (con stock/categoriaId, incluye borradores). */
export async function getProductAdminById(id: string): Promise<ProductoAdmin | null> {
  const db = getSupabase();
  if (!db) {
    const p = fallbackProductos.find((x) => x.id === id);
    return p ? fallbackAdmin(p) : null;
  }
  const { data, error } = await db.from("products").select(SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as ProductRow);
}
