import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/db/categories";

export const dynamic = "force-dynamic";

export default async function NuevoProducto({ searchParams }: { searchParams: Promise<{ linea?: string }> }) {
  const [categorias, sp] = await Promise.all([getCategories(), searchParams]);
  const lineaInicial = sp.linea === "maquillaje" ? "maquillaje" : "mochilas";
  return <ProductForm categorias={categorias} lineaInicial={lineaInicial} />;
}
