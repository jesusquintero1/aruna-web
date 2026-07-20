import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { formatPrice, getProductSchema } from "@/lib/utils";
import { getProductById, getRelatedProducts } from "@/lib/db/products";
import ProductDetailsClient from "@/components/ProductDetailsClient";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Genera metadatos dinámicos optimizados para SEO para cada producto individual en el servidor.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const producto = await getProductById(id);

  if (!producto) {
    return {
      title: "Producto No Encontrado",
    };
  }

  const formattedPrice = formatPrice(producto.precio);
  const esMaquillaje = producto.linea === "maquillaje";
  const title = esMaquillaje
    ? `${producto.nombre} - Maquillaje ARÜNA`
    : `Mochila Wayuu ${producto.nombre} - Compra Original`;
  const description = esMaquillaje
    ? `${producto.nombre} (${formattedPrice}). ${producto.descripcion.substring(0, 120)}...`
    : `${producto.nombre} tejida a mano en La Guajira por artesanas locales (${formattedPrice}). ${producto.descripcion.substring(0, 120)}...`;

  // Guarda defensiva: mapRow garantiza ≥1 imagen, pero evitamos meter `undefined`
  // en Open Graph/Twitter si algún producto llegara sin imágenes.
  const ogImage = producto.imagenes[0];

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
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 800,
              height: 1000,
              alt: producto.nombre,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const producto = await getProductById(id);

  if (!producto) {
    notFound();
  }

  // Obtener productos relacionados de la misma línea (excluyendo el actual)
  const productosRelacionados = await getRelatedProducts(producto.id, producto.linea ?? "mochilas");

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
