import React from "react";
import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import InfografiaFooter from "@/components/InfografiaFooter";
import { WayuuDivider } from "@/components/FaunaFloraIcons";
import { getProducts } from "@/lib/db/products";
import { getSetting } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "Maquillaje ARÜVIA",
  description: "Descubre la línea de maquillaje ARÜVIA: productos seleccionados con la misma dedicación que nuestras mochilas Wayuu.",
  alternates: {
    canonical: "/maquillaje",
  },
};

export const revalidate = 60;

export default async function MaquillajePage() {
  const [products, infografia] = await Promise.all([
    getProducts("maquillaje"),
    getSetting("infografia_maquillaje"),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-[70vh]">
      {/* Cabecera */}
      <div className="text-center space-y-4 max-w-xl mx-auto relative">
        <span className="text-xs uppercase font-bold tracking-widest text-cardenal block">Belleza Arüvia</span>
        <h1 className="font-lux font-bold text-4xl sm:text-5xl text-carbon">Maquillaje</h1>
        <p className="text-sm text-carbon/75 font-medium leading-relaxed">
          Nuestra línea de maquillaje, seleccionada con el mismo cuidado y amor por el detalle que ponemos en cada mochila Wayuu.
        </p>
        <WayuuDivider />
      </div>

      {products.length === 0 ? (
        <p className="text-center text-carbon/60 font-semibold py-16">
          Muy pronto: estamos preparando la colección de maquillaje.
        </p>
      ) : (
        <ProductGrid products={products} />
      )}

      {/* Infografía (se administra en /admin/contenido) */}
      <InfografiaFooter src={infografia} alt="Infografía de maquillaje ARÜVIA" />
    </div>
  );
}
