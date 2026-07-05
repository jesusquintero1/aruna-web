import type { NextConfig } from "next";

// Content Security Policy.
// Nota: Next (App Router) inyecta scripts inline para hidratación/streaming sin
// nonce, y Framer Motion inyecta estilos inline, por eso 'unsafe-inline'. next/font
// auto-aloja las fuentes (font-src 'self'). Las imágenes vienen de Supabase Storage
// y Unsplash. Se publica primero en modo Report-Only (ver header abajo): tras unos
// días sin violaciones, cambiar la cabecera a "Content-Security-Policy" (enforcing).
// Dominios de analítica (GA4 + Meta Pixel). Se agregan a la CSP aunque la
// analítica esté apagada (inofensivo si no se cargan scripts). Los scripts solo
// se inyectan tras consentimiento (ver components/AnalyticsScripts.tsx).
const GA = "https://*.googletagmanager.com https://*.google-analytics.com";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://*.supabase.co https://images.unsplash.com ${GA} https://*.facebook.com`,
  // Videos de producto servidos desde Supabase Storage
  "media-src 'self' https://*.supabase.co",
  "font-src 'self'",
  `connect-src 'self' https://*.supabase.co ${GA} https://*.facebook.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // CSP en modo enforcing. Se validó que no hay scripts/conexiones externas
  // (Mercado Pago es server-side por redirección, fuentes auto-alojadas con
  // next/font, imágenes solo de Supabase/Unsplash, scripts inline = JSON-LD
  // cubiertos por 'unsafe-inline'). Si se añade analítica/SDK externo, agregar
  // su origen a script-src/connect-src antes de desplegar.
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Las imágenes de producto se suben por una Server Action (saveProduct), cuyo
  // límite de cuerpo por defecto es 1 MB. Las fotos de celular pesan 2–5 MB, así
  // que sin esto la subida falla en silencio ("no deja montar las imágenes").
  // Nota: en Netlify la función igual tiene su propio tope (~6 MB por request);
  // para fotos muy pesadas conviene redimensionarlas antes de subir.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      // Imágenes subidas por el admin a Supabase Storage
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Placeholder de artesana (ProductDetailsClient)
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
