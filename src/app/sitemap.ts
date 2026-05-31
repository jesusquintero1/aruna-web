import { MetadataRoute } from "next";
import { productos } from "@/data/productos";
import { siteConfig } from "@/config/site";

/**
 * Generador Dinámico de Sitemap para Next.js App Router.
 * Se compila automáticamente y se sirve en `/sitemap.xml`.
 * Impulsa enormemente la indexación de productos individuales en Google.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Rutas estáticas principales
  const staticRoutes = ["", "/catalogo", "/historia", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? (1.0 as const) : (0.8 as const),
  }));

  // Rutas dinámicas de detalles de productos
  const productRoutes = productos.map((producto) => ({
    url: `${baseUrl}/producto/${producto.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9 as const,
  }));

  return [...staticRoutes, ...productRoutes];
}
