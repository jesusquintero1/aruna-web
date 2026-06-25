import { siteConfig } from "@/config/site";
import { Producto } from "@/data/productos";

/**
 * Formatea un número como pesos colombianos (COP).
 * Ejemplo: 290000 -> $290.000
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Genera los metadatos JSON-LD estructurados (Schema.org) para la Organización.
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/favicon.ico`,
    "sameAs": [
      siteConfig.contact.instagram,
      siteConfig.contact.facebook
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": siteConfig.contact.whatsapp,
      "contactType": "sales",
      "areaServed": "CO",
      "availableLanguage": "Spanish"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Maicao",
      "addressRegion": "La Guajira",
      "addressCountry": "CO"
    }
  };
}

/**
 * Genera los metadatos JSON-LD estructurados (Schema.org) para un Producto.
 */
export function getProductSchema(producto: Producto) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": producto.nombre,
    "image": producto.imagenes.map(img => img.startsWith("http") ? img : `${siteConfig.url}${img}`),
    "description": producto.descripcion,
    "sku": producto.id,
    "brand": {
      "@type": "Brand",
      "name": siteConfig.name
    },
    "offers": {
      "@type": "Offer",
      "url": `${siteConfig.url}/producto/${producto.id}`,
      "priceCurrency": "COP",
      "price": producto.precio,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": producto.disponible 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": siteConfig.name
      }
    }
  };
}
