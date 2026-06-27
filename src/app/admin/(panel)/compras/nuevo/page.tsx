import { getProductsAdmin } from "@/lib/db/products";
import PurchaseForm, { type ProductOption } from "@/components/admin/PurchaseForm";

export default async function NuevoPedidoProveedor() {
  const productos = await getProductsAdmin();
  const options: ProductOption[] = productos
    .map((p) => ({ id: p.id, nombre: p.nombre, costo: p.costo, precio: p.precio }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return <PurchaseForm productos={options} />;
}
