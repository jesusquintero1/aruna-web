import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida de servidor (Vercel). Ya NO usamos export estático porque
  // necesitamos Route Handlers, Server Actions, cookies y proxy.
  images: {
    remotePatterns: [
      // Imágenes subidas por el admin a Supabase Storage
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Placeholder de artesana (ProductDetailsClient)
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
