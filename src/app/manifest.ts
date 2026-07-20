import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Web App Manifest (PWA). Permite instalar la tienda/POS como app en el
 * dispositivo (Android/Chrome vía prompt nativo; iOS vía "Añadir a inicio").
 * Next.js sirve esto en /manifest.webmanifest y enlaza el <link rel="manifest">.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} · Punto de venta`,
    short_name: siteConfig.name,
    description: "App de administración y punto de venta de " + siteConfig.name + ".",
    start_url: "/admin/login",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a140f",
    theme_color: "#2b2118",
    lang: "es-CO",
    categories: ["business", "shopping", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
