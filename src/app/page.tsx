"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Clock, MapPin, Droplets, ShieldCheck, HeartHandshake, ChevronLeft, ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import ProductGrid from "@/components/ProductGrid";
import { WayuuDivider } from "@/components/FaunaFloraIcons";
import { getGeneralWhatsappLink } from "@/lib/utils";

export default function HomePage() {
  const whatsappUrl = getGeneralWhatsappLink();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slides del Hero Banner (Mismo concepto y estructura visual que el carrusel de Misolé)
  const slides = [
    {
      title: "El Regalo Perfecto para Almas Únicas",
      subtitle: "Piezas tejidas que parecen salidas de otro universo",
      desc: "Mochilas Wayuu auténticas de un solo hilo tejidas con alma ancestral y los tintes de la Guajira.",
      bgImage: "/images/aruna_hero.png",
      buttonText: "Ver Colección Completa",
      link: "/catalogo"
    },
    {
      title: "Colección Mística Cabo de la Vela",
      subtitle: "Inspirada en el mar Caribe y las dunas de Taroa",
      desc: "Obras de arte de hebra fina de algodón mercerizado que conservan la historia viva de nuestra cultura.",
      bgImage: "https://images.unsplash.com/photo-1528822838844-10b70d41880b?auto=format&fit=crop&q=80&w=1600",
      buttonText: "Explorar Tótems Sagrados",
      link: "/catalogo"
    }
  ];

  // Cambio automático de slides cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Categorías Circulares idénticas en estructura a la web de referencia (Misolé Categorías)
  const circularCategories = [
    { name: "Un Solo Hilo", count: "Premium", img: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=200", link: "/catalogo" },
    { name: "Doble Hilo", count: "Color & Resistencia", img: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=200", link: "/catalogo" },
    { name: "Edición Especial", count: "Diseños Sagrados", img: "https://images.unsplash.com/photo-1528822838844-10b70d41880b?auto=format&fit=crop&q=80&w=200", link: "/catalogo" },
    { name: "Accesorios", count: "Fajas & Correas", img: "https://images.unsplash.com/photo-1590739225287-bd2d544f129f?auto=format&fit=crop&q=80&w=200", link: "/catalogo" },
    { name: "Mini Mochilas", count: "Susu Mini", img: "https://images.unsplash.com/photo-1575844267725-671c8e81c107?auto=format&fit=crop&q=80&w=200", link: "/catalogo" },
  ];

  // Testimoniales de Clientes (Sección Reviews de Misolé)
  const reviews = [
    {
      text: "La mochila es simplemente de otro mundo. La finura del tejido de un solo hilo y la viveza de los colores superaron mis expectativas. Se siente el alma artesana en cada puntada.",
      author: "Catalina Restrepo",
      city: "Medellín, Colombia",
      rating: "✦✦✦✦✦"
    },
    {
      text: "Excelente atención y el envío llegó rápido y hermoso. Es reconfortante saber que gran parte de la compra apoya directamente a las maestras tejedoras y aporta agua a sus comunidades.",
      author: "Felipe Gaviria",
      city: "Bogotá, Colombia",
      rating: "✦✦✦✦✦"
    }
  ];

  const [currentReview, setCurrentReview] = useState(0);

  return (
    <div className="space-y-16 pb-20 relative overflow-hidden bg-obsidian text-sand font-sans">
      
      {/* GLOWS AMBIENTALES DE ATARDECER GUAJIRO */}
      <div className="ambient-glow bg-sunset-glow top-[-10vw] right-[-10vw] opacity-10" />
      <div className="ambient-glow bg-ocean-glow top-[60vh] left-[-20vw] opacity-10" />

      {/* ================= 1. CAROUSEL HERO SLIDER (Estilo Banner Slider de Misolé) ================= */}
      <section className="relative w-full h-[70vh] sm:h-[80vh] bg-surface-card overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Imagen del Slide */}
            <div 
              className="absolute inset-0 bg-cover bg-center select-none pointer-events-none"
              style={{ backgroundImage: `url('${slides[currentSlide].bgImage}')` }}
            />
            {/* Máscara de color degradado natural */}
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian/95 via-obsidian/75 to-transparent z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent z-0" />

            {/* Contenido del Slide */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10">
              <div className="max-w-xl space-y-4 sm:space-y-6 text-left">
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-terracotta bg-terracotta-light/65 px-4 py-1.5 rounded-full border border-terracotta/15 inline-block">
                  ✦ {slides[currentSlide].subtitle}
                </span>
                <h1 className="font-title font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-chocolate">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-xs sm:text-sm text-chocolate-light leading-relaxed font-medium max-w-md">
                  {slides[currentSlide].desc}
                </p>
                <div className="pt-2">
                  <Link
                    href={slides[currentSlide].link}
                    className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-terracotta to-desert-rose text-white py-3 px-8 rounded-full font-bold hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-md uppercase text-[10px] sm:text-xs tracking-wider"
                  >
                    <span>{slides[currentSlide].buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controles de Navegación del Carrusel */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-obsidian/45 border border-cream-dark/20 text-chocolate hover:bg-gold hover:text-white rounded-full transition-all duration-300 z-20 focus:outline-none"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-obsidian/45 border border-cream-dark/20 text-chocolate hover:bg-gold hover:text-white rounded-full transition-all duration-300 z-20 focus:outline-none"
          aria-label="Siguiente slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicadores de Banners */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSlide ? "bg-gold w-6" : "bg-cream-dark/50"
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ================= 2. MENSAJE DE BIENVENIDA (Estilo Misolé Welcome) ================= */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-3 pt-6">
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-chocolate-light">
          bienvenidos a aruna
        </span>
        <h2 className="font-title font-black text-2xl sm:text-3xl text-chocolate uppercase tracking-widest leading-none">
          Ancestral · Exclusivo · Único
        </h2>
        <p className="text-xs sm:text-sm text-chocolate-light leading-relaxed font-semibold max-w-lg mx-auto italic">
          &quot;Creamos piezas tejidas con alma, hechas para durar toda una vida y parecer salidas de otro universo.&quot;
        </p>
        <WayuuDivider className="opacity-15 max-w-xs mx-auto pt-4" />
      </section>

      {/* ================= 3. SECCIÓN CATEGORÍAS EN CÍRCULOS (Idéntico a Misolé) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h3 className="font-title font-bold text-sm uppercase tracking-widest text-terracotta">
          Nuestras Categorías
        </h3>
        
        {/* Contenedor Flex Fila de Círculos */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 pt-2">
          {circularCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.link}
              className="group flex flex-col items-center space-y-2.5 cursor-pointer select-none"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-cream-dark/50 overflow-hidden shadow-sm group-hover:border-gold group-hover:shadow-md transition-all duration-300 relative">
                {/* Imagen Circular Real */}
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-obsidian/5 group-hover:bg-transparent transition-all" />
              </div>
              <div className="text-center">
                <h4 className="font-title font-bold text-[11px] sm:text-xs text-chocolate leading-none uppercase tracking-wide">
                  {cat.name}
                </h4>
                <span className="text-[7px] sm:text-[8px] text-chocolate-light font-bold uppercase tracking-widest block pt-0.5 leading-none">
                  {cat.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 4. LO ÚLTIMO / NOVEDADES (Grilla de Productos Fiel a Misolé) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-cream-dark/30 pb-4">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-terracotta">
              El regalo perfecto para fans de corazón
            </span>
            <h2 className="font-title font-black text-2xl sm:text-3xl text-chocolate uppercase tracking-wider">
              Lo Último en Catálogo
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:underline"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Muestra la grilla de productos destacados */}
        <ProductGrid onlyFeatured={true} />

        <div className="flex justify-center sm:hidden pt-4">
          <Link
            href="/catalogo"
            className="flex items-center space-x-2 border border-cream-dark text-chocolate px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ================= 5. BANNER COLUMNS / PROMOS (Banners Categorías Elementor) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Promo Izquierda: Un Solo Hilo */}
          <div className="relative rounded-[24px] overflow-hidden bg-surface border border-cream-dark/25 p-8 flex flex-col justify-between min-h-[300px] text-left group">
            <div className="absolute inset-0 bg-kana opacity-5 z-0" />
            <div className="relative z-10 max-w-sm space-y-3">
              <span className="text-[9px] uppercase font-black tracking-widest text-terracotta">Línea de Lujo</span>
              <h3 className="font-title font-black text-2xl sm:text-3xl text-chocolate leading-tight">
                Mochilas de Un Solo Hilo
              </h3>
              <p className="text-xs text-chocolate-light leading-relaxed font-semibold">
                La técnica más fina y sagrada. Hebras tejidas a crochet por maestras expertas que dedican hasta 30 días en una sola pieza inigualable.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-terracotta to-desert-rose text-white py-2.5 px-6 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm group-hover:scale-[1.02] transition-transform"
              >
                <span>Explorar Línea</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Promo Derecha: Ediciones Especiales */}
          <div className="relative rounded-[24px] overflow-hidden bg-surface border border-cream-dark/25 p-8 flex flex-col justify-between min-h-[300px] text-left group">
            <div className="absolute inset-0 bg-kana opacity-5 z-0" />
            <div className="relative z-10 max-w-sm space-y-3">
              <span className="text-[9px] uppercase font-black tracking-widest text-caribe">Diseños Sagrados</span>
              <h3 className="font-title font-black text-2xl sm:text-3xl text-chocolate leading-tight">
                Ediciones Especiales
              </h3>
              <p className="text-xs text-chocolate-light leading-relaxed font-semibold">
                Mochilas únicas cargadas de simbología ancestral, tejidas con interpretaciones divinas de los animales, el desierto y el mar Caribe.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2 bg-chocolate text-white py-2.5 px-6 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm group-hover:scale-[1.02] transition-transform"
              >
                <span>Ver Diseños</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 6. TESTIMONIALS SLIDER (Reviews de Misolé) ================= */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-8 py-10">
        <h3 className="font-title font-bold text-sm uppercase tracking-widest text-terracotta">
          Opiniones de Clientes
        </h3>
        
        <div className="relative glass-panel rounded-3xl p-8 sm:p-12 border border-cream-dark/25 shadow-sm max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-kana opacity-[0.04] z-0" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReview}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 space-y-4"
            >
              <div className="text-gold text-sm tracking-wider font-bold">
                {reviews[currentReview].rating}
              </div>
              <p className="text-xs sm:text-sm text-chocolate leading-relaxed font-semibold italic">
                &quot;{reviews[currentReview].text}&quot;
              </p>
              <div className="space-y-0.5 pt-2">
                <h4 className="font-title font-bold text-xs text-chocolate">
                  {reviews[currentReview].author}
                </h4>
                <span className="text-[9px] text-chocolate-light font-bold uppercase tracking-widest">
                  {reviews[currentReview].city}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots de navegación testimoniales */}
          <div className="flex justify-center space-x-2 pt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentReview ? "bg-gold w-4" : "bg-cream-dark/60"
                }`}
                aria-label={`Testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. COMPROMISO ANCESTRAL (Hecho en Colombia) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-cream-dark/25 rounded-[24px] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-kana opacity-[0.05] z-0" />
          <div className="relative z-10 max-w-xl mx-auto space-y-4 text-chocolate">
            <span className="text-[10px] uppercase font-black tracking-widest text-terracotta block">
              hecho en colombia con amor
            </span>
            <h2 className="font-title font-black text-2xl sm:text-3xl uppercase tracking-wider">
              Tejido a Mano en La Guajira
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-chocolate-light font-semibold">
              Cada mochila Aruna es confeccionada en las rancherías de la Alta Guajira por tejedoras expertas que heredan la técnica de generación en generación. Tu compra aporta un sustento justo a sus familias y agua limpia a sus comunidades.
            </p>
            <div className="flex justify-center items-center gap-6 pt-4 border-t border-cream-dark/20 text-left">
              <div className="flex items-center space-x-2">
                <HeartHandshake className="w-5 h-5 text-terracotta" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Comercio 100% Directo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-caribe" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Apoyo en Agua Potable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. LIFESTYLE INSTAGRAM GRID (Estilo Misolé Feed) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[9px] uppercase font-black tracking-widest text-terracotta">
            Síguenos en @arunawayuu
          </span>
          <h3 className="font-title font-black text-xl sm:text-2xl text-chocolate uppercase tracking-wider">
            Historias en Hilados
          </h3>
        </div>

        {/* Grilla de imágenes lifestyle */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {[
            "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1528822838844-10b70d41880b?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1590739225287-bd2d544f129f?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1575844267725-671c8e81c107?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=300",
          ].map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden border border-cream-dark/20 hover:scale-102 hover:shadow-md transition-all duration-300 select-none group"
            >
              <img
                src={url}
                alt="Wayuu lifestyle"
                className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-obsidian/10 group-hover:bg-transparent transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* ================= 9. PREGUNTAS FRECUENTES (FAQ) ================= */}
      <section className="max-w-3xl mx-auto px-4 space-y-10 pt-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-terracotta">
            Dudas Frecuentes
          </span>
          <h2 className="font-title font-black text-2xl sm:text-3xl text-chocolate uppercase tracking-wider">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-4 text-left">
          {siteConfig.faqs.slice(0, 4).map((faq, index) => (
            <details
              key={index}
              className="group border border-cream-dark/25 rounded-2xl bg-surface/30 hover:border-gold/30 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between p-5 font-title font-bold text-xs sm:text-sm text-chocolate cursor-pointer select-none focus:outline-none">
                <span>{faq.question}</span>
                <span className="ml-1.5 flex-shrink-0 p-1 text-chocolate-light group-open:text-gold group-hover:text-gold transition-colors">
                  <svg
                    className="w-5 h-5 transform group-open:rotate-180 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-0 text-xs text-chocolate-light leading-relaxed font-sans font-medium border-t border-cream-dark/15">
                <p className="pt-4">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
