import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getProducts } from "@/lib/db/products";

export const revalidate = 60;

/**
 * Generador dinámico de Sitemap. Los productos se leen desde la DB.
 * Se sirve en `/sitemap.xml` e impulsa la indexación en Google.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const staticRoutes = ["", "/catalogo", "/historia", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? (1.0 as const) : (0.8 as const),
  }));

  const productos = await getProducts();
  const productRoutes = productos.map((producto) => ({
    url: `${baseUrl}/producto/${producto.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9 as const,
  }));

  return [...staticRoutes, ...productRoutes];
}
