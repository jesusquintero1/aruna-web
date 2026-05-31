import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { WayuuDivider, ColibriIcon } from "@/components/FaunaFloraIcons";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "El Blog de ARUNA - Cultura y Cuidado de la Mochila Wayuu",
  description: "Aprende cómo lavar tu mochila Wayuu, conoce la diferencia entre un hilo y dos hilos, descubre mitos de La Guajira y más en el blog oficial de ARUNA.",
  alternates: {
    canonical: "/blog",
  },
};

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

export default function BlogHubPage() {
  // Post del blog preparados para atacar keywords de cola larga y estructurar SEO
  const posts: BlogPost[] = [
    {
      slug: "como-lavar-mochila-wayuu-paso-a-paso",
      title: "Cómo lavar una mochila Wayuu: Guía completa de cuidado",
      description: "Aprende paso a paso cómo lavar tu mochila Wayuu tejida a mano sin dañar sus fibras ni perder la intensidad de sus colores tradicionales.",
      date: "Mayo 28, 2026",
      readTime: "4 min de lectura",
      category: "Cuidado y Guía",
      image: "https://images.unsplash.com/photo-1590736969955-71cb94801759?auto=format&fit=crop&q=80&w=600",
    },
    {
      slug: "diferencia-mochila-wayuu-un-hilo-y-dos-hilos",
      title: "Mochila Wayuu de un solo hilo vs dos hilos: ¿Cuál es la diferencia?",
      description: "Descubre por qué las mochilas de un solo hilo son consideradas joyas premium y cómo identificar la calidad de hebra fina frente a las de doble hilo.",
      date: "Mayo 15, 2026",
      readTime: "6 min de lectura",
      category: "Cultura y Calidad",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
    },
    {
      slug: "simbologia-kanas-tejido-wayuu-significado",
      title: "El significado sagrado de los Kanas: Geometría de La Guajira",
      description: "Una inmersión profunda en los patrones de bordados geométricos Wayuu. Aprende a interpretar el Irapa, el Molokonoutshi y su conexión mitológica.",
      date: "Abril 30, 2026",
      readTime: "8 min de lectura",
      category: "Mitología",
      image: "https://images.unsplash.com/photo-1528822838844-10b70d41880b?auto=format&fit=crop&q=80&w=600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 min-h-screen text-left">
      
      {/* Cabecera / Título */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-flamenco block flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4 text-flamenco" />
          Bitácora Aruna
        </span>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-carbon">Cultura & Saber</h1>
        <p className="text-sm text-carbon/75 font-medium leading-relaxed">
          Explora artículos detallados sobre la historia del pueblo Wayuu, tutoriales prácticos de cuidado, diferencias técnicas de tejido y crónicas de La Guajira.
        </p>
        <WayuuDivider />
      </div>

      {/* Grid de Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group flex flex-col bg-arena-oscura/10 border border-arena-oscura/30 rounded-2xl overflow-hidden hover:shadow-xl hover:border-arena-oscura transition-all duration-300 h-full"
          >
            {/* Imagen de Portada */}
            <div className="relative aspect-video w-full bg-arena-oscura/20 overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-carbon text-arena text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow backdrop-blur-sm">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-grow p-6 flex flex-col">
              <div className="flex items-center space-x-3 text-[10px] text-carbon/50 uppercase font-bold tracking-wider mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
                <span>•</span>
                <span>{post.date}</span>
              </div>

              <h2 className="font-display font-black text-xl text-carbon mb-3 group-hover:text-cardenal transition-colors">
                {post.title}
              </h2>

              <p className="text-xs text-carbon/75 leading-relaxed font-medium mb-6 flex-grow">
                {post.description}
              </p>

              {/* Botón de Enlace (Futuro) */}
              <div className="mt-auto pt-4 border-t border-arena-oscura/20 flex items-center justify-between">
                <span className="text-[10px] text-carbon/40 font-bold uppercase tracking-widest">
                  Articulo en preparación
                </span>
                <span className="inline-flex items-center space-x-1 text-cardenal group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Caja de Registro al Newsletter del Blog */}
      <section className="bg-arena-oscura/15 border border-arena-oscura/35 p-8 sm:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-kana opacity-5 z-0" />
        
        <div className="relative z-10 max-w-md mx-auto space-y-4">
          <ColibriIcon size={44} className="text-flamenco mx-auto animate-colibri" />
          <h2 className="font-display font-black text-2xl text-carbon">Recibe Crónicas de La Guajira</h2>
          <p className="text-xs sm:text-sm text-carbon/70 font-medium leading-relaxed">
            Suscríbete para recibir historias sobre la cosmovisión Wayuu, alertas de nuevas mochilas exclusivas y guías de artesanías directo en tu correo.
          </p>
          
          <NewsletterForm />
          <span className="text-[9px] text-carbon/40 block pt-1 font-medium">
            Respetamos tu privacidad. No enviamos spam y puedes desuscribirte en cualquier momento.
          </span>
        </div>
      </section>

    </div>
  );
}
