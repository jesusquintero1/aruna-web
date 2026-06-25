import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/db/categories";

export const dynamic = "force-dynamic";

export default async function NuevoProducto() {
  const categorias = await getCategories();
  return <ProductForm categorias={categorias} />;
}
