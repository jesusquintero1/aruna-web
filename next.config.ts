import type { NextConfig } from "next";

// Content Security Policy.
// Nota: Next (App Router) inyecta scripts inline para hidratación/streaming sin
// nonce, y Framer Motion inyecta estilos inline, por eso 'unsafe-inline'. next/font
// auto-aloja las fuentes (font-src 'self'). Las imágenes vienen de Supabase Storage
// y Unsplash. Se publica primero en modo Report-Only (ver header abajo): tras unos
// días sin violaciones, cambiar la cabecera a "Content-Security-Policy" (enforcing).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co https://images.unsplash.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // CSP en modo Report-Only durante el rodaje. Cambiar la clave a
  // "Content-Security-Policy" para aplicarla (enforcing) cuando esté validada.
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
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
