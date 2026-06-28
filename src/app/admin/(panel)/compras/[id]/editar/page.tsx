import { notFound } from "next/navigation";
import { getPurchaseOrderById } from "@/lib/db/purchases";
import { getProductsAdmin } from "@/lib/db/products";
import PurchaseForm, { type ProductOption, type PurchaseInitial } from "@/components/admin/PurchaseForm";

export const dynamic = "force-dynamic";

export default async function EditarCompra({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pedido, productos] = await Promise.all([getPurchaseOrderById(id), getProductsAdmin()]);
  if (!pedido) notFound();

  const options: ProductOption[] = productos
    .map((p) => ({ id: p.id, nombre: p.nombre, costo: p.costo, precio: p.precio }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const initial: PurchaseInitial = {
    id: pedido.id,
    proveedor: pedido.proveedor ?? "",
    fecha: pedido.fecha ?? "",
    costoEnvio: pedido.costo_envio ? String(pedido.costo_envio) : "",
    notas: pedido.notas ?? "",
    items: (pedido.purchase_items ?? []).map((it) => ({
      product_id: it.product_id ?? "",
      referencia: it.referencia ?? "",
      cantidad: String(it.cantidad),
      costo_unitario: String(it.costo_unitario),
      precio_venta: String(it.precio_venta),
    })),
  };

  return <PurchaseForm productos={options} initial={initial} />;
}
