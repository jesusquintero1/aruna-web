import HomeClient from "@/components/HomeClient";
import { getFeaturedProducts, getProducts } from "@/lib/db/products";

// Revalidar cada 60s (ISR) — refleja cambios del admin sin reconstruir.
export const revalidate = 60;

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedProducts(), getProducts()]);
  const disponibles = all.filter((p) => p.disponible).length;
  return <HomeClient featured={featured} disponibles={disponibles} />;
}
