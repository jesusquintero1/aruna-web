import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { productos } from "@/data/productos";
import { siteConfig } from "@/config/site";
import { formatPrice, getProductSchema } from "@/lib/utils";
import ProductDetailsClient from "@/components/ProductDetailsClient";

export async function generateStaticParams() {
  return productos.map((producto) => ({
    id: producto.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Genera metadatos dinámicos optimizados para SEO para cada producto individual en el servidor.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    return {
      title: "Producto No Encontrado",
    };
  }

  const formattedPrice = formatPrice(producto.precio);
  const title = `Mochila Wayuu ${producto.nombre} - Compra Original`;
  const description = `${producto.nombre} tejida a mano en La Guajira por artesanas locales (${formattedPrice}). ${producto.descripcion.substring(0, 120)}...`;

  return {
    title,
    description,
    keywords: [
      producto.nombre.toLowerCase(),
      "mochila wayuu original",
      "artesanías wayuu",
      "hecho a mano La Guajira",
      "mochilas de un solo hilo",
      ...siteConfig.seoKeywords,
    ],
    alternates: {
      canonical: `/producto/${producto.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/producto/${producto.id}`,
      type: "article",
      images: [
        {
          url: producto.imagenes[0],
          width: 800,
          height: 1000,
          alt: producto.nombre,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [producto.imagenes[0]],
    },
  };
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    notFound();
  }

  // Obtener productos relacionados (destacados o de la misma categoría, excluyendo el actual)
  const productosRelacionados = productos
    .filter((p) => p.id !== producto.id && p.disponible)
    .slice(0, 4);

  // Schema.org para rastreadores de búsqueda
  const jsonLd = getProductSchema(producto);

  return (
    <>
      {/* Marcado de datos estructurados Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProductDetailsClient
          producto={producto}
          productosRelacionados={productosRelacionados}
        />
      </div>
    </>
  );
}
