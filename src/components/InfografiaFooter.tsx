import Image from "next/image";

/**
 * Imagen informativa al pie del catálogo (guía de tallas de mochilas,
 * infografía de maquillaje…). Se administra desde /admin/contenido.
 */
export default function InfografiaFooter({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return null;
  return (
    <section className="max-w-3xl mx-auto pt-4">
      <div className="relative w-full rounded-[24px] overflow-hidden border border-cream-dark/40 bg-surface">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={900}
          className="w-full h-auto"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
    </section>
  );
}
