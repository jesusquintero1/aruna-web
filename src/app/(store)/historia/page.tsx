import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import {
  ColibriIcon,
  FlamencoIcon,
  CardenalIcon,
  CactusIcon,
  LirioIcon,
  PeoniaIcon,
  DelfinIcon,
  WayuuDivider
} from "@/components/FaunaFloraIcons";

export const metadata: Metadata = {
  title: "Nuestra Historia y Simbología Wayuu",
  description: "Descubre el origen del tejido Wayuu en La Guajira, Colombia. Conoce el significado de los Kanas (figuras geométricas) y nuestro compromiso con el comercio justo.",
  alternates: {
    canonical: "/historia",
  },
};

export default function HistoriaPage() {
  const kanasSignificados = [
    {
      symbol: "Irapa",
      title: "Caparazón de Tortuga",
      description: "Uno de los kanas más respetados. Simboliza la longevidad, la sabiduría profunda, la protección y la paciencia del pueblo Wayuu en los tiempos difíciles.",
    },
    {
      symbol: "Molokonoutshi",
      title: "Caparazón de Caimán",
      description: "Representa la resiliencia y el respeto sagrado por el agua. Hace alusión a la fuerza vital que habita en las ciénagas y ríos de La Guajira.",
    },
    {
      symbol: "Siwottouhi",
      title: "Huella del Caballo",
      description: "Narra la libertad, la movilidad y los senderos recorridos por los antepasados a lo largo del desierto guajiro y la Alta Guajira.",
    },
    {
      symbol: "Kuliichiya",
      title: "Techo de la Choza",
      description: "Simboliza el hogar, la estructura de la familia, el cobijo de la comunidad y la unión inquebrantable de los clanes familiares.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 min-h-screen text-left">
      
      {/* Cabecera / Título */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-cardon block">El Origen Ancestral</span>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-carbon">Tejiendo el Cosmos</h1>
        <p className="text-sm text-carbon/75 font-medium leading-relaxed">
          Para la comunidad Wayuu, tejer es mucho más que entrelazar hilos; es plasmar el pensamiento, dibujar el territorio y resguardar la memoria histórica de nuestra cultura.
        </p>
        <WayuuDivider />
      </div>

      {/* Sección 1: El Mito de Wale' Kerü (La Araña) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs uppercase font-bold tracking-widest text-cardenal">La Leyenda</span>
          <h2 className="font-display font-black text-3xl text-carbon">El Mito de Wale&apos; Kerü</h2>
          <p className="text-sm sm:text-base text-carbon/80 leading-relaxed font-medium">
            Cuenta la leyenda tradicional que el arte de tejer fue revelado a las mujeres Wayuu por <strong>Wale&apos; Kerü</strong>, una araña tejedora mitológica. Wale&apos; Kerü siempre tejía bajo la luz de la luna, creando fajas y mochilas hermosas con patrones nunca antes vistos. 
          </p>
          <p className="text-sm sm:text-base text-carbon/80 leading-relaxed font-medium">
            Una joven de la ranchería, fascinada por los diseños, le pidió a la araña que le enseñara sus secretos. Wale&apos; Kerü aceptó enseñarle, pero con una condición: el tejido debía hacerse con absoluto respeto, paciencia y silencio, pues cada puntada expresaba un pensamiento del alma. Desde entonces, el tejido se convirtió en un rito de paso y en el mayor orgullo de las mujeres de nuestra comunidad.
          </p>
        </div>
        
        {/* Gráfico decorativo Araña/Tejido */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-[340px] bg-arena-oscura/15 border border-arena-oscura/35 p-8 rounded-3xl text-center overflow-hidden">
            <div className="absolute inset-0 bg-kana opacity-10" />
            <ColibriIcon size={80} className="text-flamenco mx-auto mb-4 animate-colibri relative z-10" />
            <h3 className="font-display font-bold text-lg text-carbon relative z-10">Wale&apos; Kerü</h3>
            <p className="text-xs text-carbon/60 pt-2 relative z-10">
              &quot;El hilo de la vida se teje con la paciencia de la araña y la mística de la luna guajira.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Sección 2: El Significado de los Kanas */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-flamenco">Simbología</span>
          <h2 className="font-display font-black text-3xl text-carbon">El Lenguaje de los Kanas</h2>
          <p className="text-sm text-carbon/75 max-w-lg mx-auto font-medium">
            Los Kanas son las figuras geométricas que decoran nuestras mochilas. Cada una representa una interpretación de la naturaleza y del universo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kanasSignificados.map((kana, index) => (
            <div
              key={index}
              className="bg-arena border border-arena-oscura/45 p-6 rounded-2xl flex flex-col justify-between hover:border-cardenal shadow-sm transition-all"
            >
              <div className="space-y-4">
                {/* Patrón Kana dibujado en SVG sutil */}
                <div className="w-12 h-12 bg-arena-oscura/20 rounded-xl flex items-center justify-center text-cardenal">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M0 12 L12 0 L24 12 L12 24 Z" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <h3 className="font-display font-black text-lg text-carbon">
                  {kana.title}
                </h3>
                <p className="text-xs leading-relaxed text-carbon/75 font-medium">
                  {kana.description}
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-carbon/40 pt-4 block">
                Kana: {kana.symbol}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Sección 3: Fauna, Flora y Conexión */}
      <section className="bg-arena-oscura/15 border border-arena-oscura/35 p-8 sm:p-12 lg:p-16 rounded-3xl space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-kana opacity-5" />
        <div className="relative z-10 text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-cardon">La Guajira en Detalle</span>
          <h2 className="font-display font-black text-3xl text-carbon">El Ecosistema Sagrado</h2>
          <p className="text-sm leading-relaxed text-carbon/80 font-medium">
            Nuestros tejidos se alimentan de la biodiversidad y el folklore de La Guajira. Desde las dunas doradas del Cabo de la Vela hasta el verde resiliente de los cactus Cardón y la elegancia rosada de los flamencos que descansan en sus lagunas costeras.
          </p>
        </div>

        {/* Mosaico de Íconos de Fauna y Flora */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
          <div className="bg-arena border border-arena-oscura/25 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <FlamencoIcon size={48} />
            <span className="font-display font-bold text-xs text-carbon mt-2">Flamenco</span>
          </div>
          <div className="bg-arena border border-arena-oscura/25 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <CactusIcon size={48} />
            <span className="font-display font-bold text-xs text-carbon mt-2">Cardón</span>
          </div>
          <div className="bg-arena border border-arena-oscura/25 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <CardenalIcon size={48} />
            <span className="font-display font-bold text-xs text-carbon mt-2">Cardenal</span>
          </div>
          <div className="bg-arena border border-arena-oscura/25 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <LirioIcon size={48} />
            <span className="font-display font-bold text-xs text-carbon mt-2">Lirio</span>
          </div>
          <div className="bg-arena border border-arena-oscura/25 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <PeoniaIcon size={48} />
            <span className="font-display font-bold text-xs text-carbon mt-2">Peonía</span>
          </div>
          <div className="bg-arena border border-arena-oscura/25 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <DelfinIcon size={48} />
            <span className="font-display font-bold text-xs text-carbon mt-2">Delfín</span>
          </div>
        </div>
      </section>

      {/* Sección 4: Comercio Justo */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 flex items-center justify-center order-last lg:order-first">
          <div className="relative aspect-square w-full max-w-[320px] rounded-3xl overflow-hidden bg-arena-oscura/20 border border-arena-oscura/35 shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1528822838844-10b70d41880b?auto=format&fit=crop&q=80&w=800"
              alt="Hilos coloridos en manos"
              width={320}
              height={320}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs uppercase font-bold tracking-widest text-cardon">Nuestro Compromiso</span>
          <h2 className="font-display font-black text-3xl text-carbon">Tejiendo un Comercio Justo</h2>
          <p className="text-sm sm:text-base text-carbon/80 leading-relaxed font-medium">
            En ARÜNA creemos firmemente que la preservación de la tradición solo es posible si se honra con dignidad el trabajo de sus creadoras. Por ello, trabajamos bajo un modelo de comercio directo y precio justo.
          </p>
          <p className="text-sm sm:text-base text-carbon/80 leading-relaxed font-medium">
            Esto garantiza que el 70% del valor de cada mochila llegue directamente a la maestra artesana que la tejió, permitiéndole sostener su ranchería, educar a sus hijos y adquirir hilos de la mejor calidad para continuar su arte ancestral. Tu compra tiene un impacto directo, real y sostenible.
          </p>
        </div>
      </section>

    </div>
  );
}
