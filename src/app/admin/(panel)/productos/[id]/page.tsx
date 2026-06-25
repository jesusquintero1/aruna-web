import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/db/categories";
import { getProductAdminById } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([getProductAdminById(id), getCategories()]);
  if (!producto) notFound();
  return <ProductForm producto={producto} categorias={categorias} />;
}
