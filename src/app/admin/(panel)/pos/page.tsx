import POSClient from "@/components/admin/POSClient";
import { getProductsAdmin } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const productos = await getProductsAdmin();
  const disponibles = productos.filter((p) => p.stock > 0);
  return <POSClient products={disponibles} />;
}
