import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db/orders";
import { getProductsAdmin } from "@/lib/db/products";
import OrderEditClient from "@/components/admin/OrderEditClient";

export const dynamic = "force-dynamic";

export default async function EditarPedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, products] = await Promise.all([getOrderById(id), getProductsAdmin()]);
  if (!order) notFound();
  return <OrderEditClient order={order} products={products} />;
}
