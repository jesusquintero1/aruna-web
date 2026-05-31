import React from "react";
import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import { WayuuDivider, LirioIcon, DelfinIcon } from "@/components/FaunaFloraIcons";

export const metadata: Metadata = {
  title: "Catálogo de Mochilas Wayuu Originales",
  description: "Compra mochilas Wayuu auténticas tejidas a mano. Diseños de un solo hilo, hebra fina y combinaciones únicas directamente desde La Guajira, Colombia.",
  alternates: {
    canonical: "/catalogo",
  },
};

export default function CatalogoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-[70vh]">
      {/* Cabecera del Catálogo */}
      <div className="text-center space-y-4 max-w-xl mx-auto relative">
        <span className="text-xs uppercase font-bold tracking-widest text-cardenal block">Galería Ancestral</span>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-carbon">Colección ARUNA</h1>
        <p className="text-sm text-carbon/75 font-medium leading-relaxed">
          Cada mochila es una obra de arte tejida en un ciclo de 25 días. Al comprar una mochila Aruna, te llevas una pieza irrepetible y apoyas directamente al pueblo artesano de La Guajira.
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
      <ProductGrid />
    </div>
  );
}
