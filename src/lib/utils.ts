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
 * Genera el enlace de WhatsApp para un producto individual.
 * Con mensaje prellenado que incluye el nombre del producto y el precio.
 */
export function getProductWhatsappLink(producto: Producto): string {
  const cleanPhone = siteConfig.contact.whatsapp.replace(/[+\s-]/g, "");
  const formattedPrice = formatPrice(producto.precio);
  
  const text = `Hola ${siteConfig.name}, estoy interesado/a en la mochila *${producto.nombre}* (${formattedPrice}). ¿Está disponible para entrega inmediata? Me encantaría conocer más detalles. Muchas gracias! \n\nEnlace: ${siteConfig.url}/producto/${producto.id}`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Genera el enlace de WhatsApp para una consulta general o del botón flotante.
 */
export function getGeneralWhatsappLink(): string {
  const cleanPhone = siteConfig.contact.whatsapp.replace(/[+\s-]/g, "");
  const text = `Hola ${siteConfig.name}, estoy visitando su tienda web y me encantaría recibir asesoría para elegir una mochila Wayuu original. ¿Me podrían ayudar?`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Genera el enlace de WhatsApp para finalizar un pedido de carrito.
 */
export function getCartWhatsappLink(items: { product: Producto; quantity: number }[]): string {
  const cleanPhone = siteConfig.contact.whatsapp.replace(/[+\s-]/g, "");
  
  let orderDetails = "";
  let total = 0;
  
  items.forEach((item) => {
    const itemTotal = item.product.precio * item.quantity;
    orderDetails += `- ${item.quantity}x *${item.product.nombre}* (${formatPrice(item.product.precio)} c/u) = ${formatPrice(itemTotal)}\n`;
    total += itemTotal;
  });
  
  const text = `Hola ${siteConfig.name}, me gustaría realizar un pedido con el siguiente carrito de compras:\n\n${orderDetails}\n*Total del Pedido: ${formatPrice(total)}*\n\n¿Cuáles son los pasos a seguir para el pago y el envío en Colombia o internacional? ¡Gracias!`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
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
