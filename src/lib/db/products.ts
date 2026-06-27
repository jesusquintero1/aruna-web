import "server-only";
import { getSupabase } from "@/lib/supabase/server";
import { productos as fallbackProductos, type Producto } from "@/data/productos";

/** Producto con campos adicionales que solo necesita el admin (stock, costo, categoría id). */
export interface ProductoAdmin extends Producto {
  stock: number;
  costo: number;
  categoriaId: string | null;
}

interface ProductRow {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number | null;
  precio_anterior: number | null;
  imagenes: string[];
  colores: string[];
  categoria_id: string | null;
  simbolo: Producto["simbolo"];
  destacado: boolean;
  stock: number;
  categories: { nombre: string } | null;
}

function mapRow(row: ProductRow): ProductoAdmin {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: row.precio,
    precioAnterior: row.precio_anterior ?? undefined,
    imagenes: row.imagenes?.length ? row.imagenes : ["/images/mochila_cardenal.png"],
    descripcion: row.descripcion ?? "",
    colores: row.colores ?? [],
    categoria: row.categories?.nombre ?? "General",
    disponible: row.stock > 0,
    destacado: row.destacado,
    simbolo: row.simbolo,
    stock: row.stock,
    costo: row.costo ?? 0,
    categoriaId: row.categoria_id,
  };
}

const SELECT = "*, categories(nombre)";

/** Todos los productos (storefront). Fallback al array hardcodeado si no hay DB. */
export async function getProducts(): Promise<Producto[]> {
  const db = getSupabase();
  if (!db) return fallbackProductos;
  const { data, error } = await db.from("products").select(SELECT).order("created_at", { ascending: false });
  if (error || !data) return fallbackProductos;
  return (data as ProductRow[]).map(mapRow);
}

/** Productos destacados (home). */
export async function getFeaturedProducts(): Promise<Producto[]> {
  const db = getSupabase();
  if (!db) return fallbackProductos.filter((p) => p.destacado);
  const { data, error } = await db.from("products").select(SELECT).eq("destacado", true).order("created_at", { ascending: false });
  if (error || !data) return fallbackProductos.filter((p) => p.destacado);
  return (data as ProductRow[]).map(mapRow);
}

/** Un producto por id (slug). */
export async function getProductById(id: string): Promise<Producto | null> {
  const db = getSupabase();
  if (!db) return fallbackProductos.find((p) => p.id === id) ?? null;
  const { data, error } = await db.from("products").select(SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as ProductRow);
}

/** Productos relacionados (disponibles, excluyendo el actual). */
export async function getRelatedProducts(id: string): Promise<Producto[]> {
  const all = await getProducts();
  return all.filter((p) => p.id !== id && p.disponible).slice(0, 4);
}

/** Lista para el admin (incluye stock y categoriaId). */
export async function getProductsAdmin(): Promise<ProductoAdmin[]> {
  const db = getSupabase();
  if (!db) {
    return fallbackProductos.map((p) => ({ ...p, stock: p.disponible ? 1 : 0, costo: 0, categoriaId: null }));
  }
  const { data, error } = await db.from("products").select(SELECT).order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as ProductRow[]).map(mapRow);
}

/** Un producto para el admin (con stock/categoriaId). */
export async function getProductAdminById(id: string): Promise<ProductoAdmin | null> {
  const db = getSupabase();
  if (!db) {
    const p = fallbackProductos.find((x) => x.id === id);
    return p ? { ...p, stock: p.disponible ? 1 : 0, costo: 0, categoriaId: null } : null;
  }
  const { data, error } = await db.from("products").select(SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as ProductRow);
}
