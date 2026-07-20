import React from "react";
import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import InfografiaFooter from "@/components/InfografiaFooter";
import { WayuuDivider, LirioIcon, DelfinIcon } from "@/components/FaunaFloraIcons";
import { getProducts } from "@/lib/db/products";
import { getSetting } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "Catálogo de Mochilas Wayuu Originales",
  description: "Compra mochilas Wayuu auténticas tejidas a mano. Diseños de un solo hilo, hebra fina y combinaciones únicas directamente desde La Guajira, Colombia.",
  alternates: {
    canonical: "/catalogo",
  },
};

export const revalidate = 60;

export default async function CatalogoPage() {
  const [products, infografia] = await Promise.all([
    getProducts("mochilas"),
    getSetting("infografia_mochilas"),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-[70vh]">
      {/* Cabecera del Catálogo */}
      <div className="text-center space-y-4 max-w-xl mx-auto relative">
        <span className="text-xs uppercase font-bold tracking-widest text-cardenal block">Galería Ancestral</span>
        <h1 className="font-lux font-bold text-4xl sm:text-5xl text-carbon">Colección ARÜVIA</h1>
        <p className="text-sm text-carbon/75 font-medium leading-relaxed">
          Cada mochila es una obra de arte tejida en un ciclo de 25 días. Al comprar una mochila Arüvia, te llevas una pieza irrepetible y apoyas directamente al pueblo artesano de La Guajira.
        </p>

        {/* Separador de la Marca */}
        <WayuuDivider />

        {/* Flora/Fauna decorativa flotando sutilmente a los lados */}
        <div className="absolute -top-6 -left-12 opacity-15 hidden lg:block">
          <LirioIcon size={56} />
        </div>
        <div className="absolute -top-6 -right-12 opacity-15 hidden lg:block">
          <DelfinIcon size={56} />
        </div>
      </div>

      {/* Grid de Productos con filtros integrados */}
      <ProductGrid products={products} />

      {/* Guía de tallas / infografía (se administra en /admin/contenido) */}
      <InfografiaFooter src={infografia} alt="Guía de tallas de mochilas Wayuu" />
    </div>
  );
}
