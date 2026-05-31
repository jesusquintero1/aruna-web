"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Clock, MapPin, Droplets } from "lucide-react";
import { siteConfig } from "@/config/site";
import ProductGrid from "@/components/ProductGrid";
import {
  WayuuDivider
} from "@/components/FaunaFloraIcons";
import { getGeneralWhatsappLink } from "@/lib/utils";

export default function HomePage() {
  const whatsappUrl = getGeneralWhatsappLink();

  // Contenedor para animaciones secuenciales en el Hero
  const heroContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };



  // Pasos de la Ranchería
  const milestones = [
    {
      num: "01",
      title: "El Hilo Sagrado",
      text: "Las tejedoras seleccionan hilos de algodón mercerizado de la más alta calidad, logrando colores vivos que resisten el paso del tiempo."
    },
    {
      num: "02",
      title: "El Baile del Crochet",
      text: "Un solo hilo requiere una concentración extrema y una aguja diminuta. Cada puntada es un latido de paciencia que toma hasta 30 días completar."
    },
    {
      num: "03",
      title: "Tejer la Identidad",
      text: "Al tejer un Kanaas, la artesana plasma su estado de ánimo, sus sueños y sus tótems animales. No existen dos mochilas idénticas en el mundo."
    },
    {
      num: "04",
      title: "Comercio de Impacto",
      text: "El 80% de cada venta va directamente a las familias de las artesanas. Además, financiamos proyectos de pozos de agua potable en Uribia."
    }
  ];

  return (
    <div className="space-y-32 pb-24 relative overflow-hidden bg-obsidian text-sand font-sans">
      
      {/* GLOWS AMBIENTALES DE LA GUAJIRA (Estilo Vite) */}
      <div className="ambient-glow bg-sunset-glow top-[-10vw] right-[-10vw]" />
      <div className="ambient-glow bg-ocean-glow top-[40vh] left-[-20vw]" />

      {/* ================= 1. HERO MAJESTUOSO (Rising Sun style) ================= */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-white/5 py-24">
        {/* Imagen del Hero con parallax sutil en background */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-zoomBg z-0 opacity-45 select-none pointer-events-none"
          style={{ backgroundImage: "url('/images/aruna_hero.png')" }}
        />
        {/* Máscara de color degradado oscuro */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent z-0" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          {/* Contenido de Textos */}
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="show"
            className="lg:col-span-8 space-y-6 sm:space-y-8 text-left"
          >
            {/* Tagline Dot Badge */}
            <motion.div variants={heroItem} className="inline-flex items-center space-x-2 bg-white/5 px-4.5 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-gold font-title">
                ✦ EL RISING SUN DE LA GUAJIRA
              </span>
            </motion.div>

            {/* Título Principal */}
            <motion.h1
              variants={heroItem}
              className="font-title font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]"
            >
              El Alma Tejida <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-gold italic">del Desierto</span>
            </motion.h1>

            {/* Descripción */}
            <motion.p
              variants={heroItem}
              className="text-base sm:text-lg text-sand-muted max-w-2xl leading-relaxed font-sans font-medium"
            >
              ARUNA une el lujo contemporáneo con el legado sagrado Wayuu. Mochilas tejidas a un solo hilo por maestras artesanas, inspiradas por la fauna mística, el mar del Cabo de la Vela y las dunas de oro de La Guajira.
            </motion.p>

            {/* Botones de acción */}
            <motion.div variants={heroItem} className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/catalogo"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-terracotta to-gold text-obsidian py-4.5 px-9 rounded-full font-bold hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-xl shadow-terracotta/20 uppercase text-xs tracking-wider"
              >
                <span>Explorar Colección</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-white/5 border border-white/15 text-sand py-4.5 px-9 rounded-full font-bold hover:bg-white/10 active:scale-95 transition-all duration-300 text-xs uppercase tracking-wider backdrop-blur-md"
              >
                <span>Teje tu Historia</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Widget de Información del Hero */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="lg:col-span-4 hidden lg:block"
          >
            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative z-10 max-w-[280px] ml-auto">
              <div className="space-y-6 text-left">
                <div>
                  <span className="text-[10px] text-sand-muted uppercase font-bold tracking-widest block mb-1">Tiempo de Tejido</span>
                  <span className="font-title text-xl font-bold text-gold flex items-center gap-1.5">
                    <Clock className="w-5 h-5 text-terracotta" />
                    25 Días
                  </span>
                </div>
                <div className="h-[1px] bg-white/10" />
                <div>
                  <span className="text-[10px] text-sand-muted uppercase font-bold tracking-widest block mb-1">Técnica Fina</span>
                  <span className="font-title text-xl font-bold text-gold flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-terracotta" />
                    1 Hilo (Máxima Finura)
                  </span>
                </div>
                <div className="h-[1px] bg-white/10" />
                <div>
                  <span className="text-[10px] text-sand-muted uppercase font-bold tracking-widest block mb-1">Origen</span>
                  <span className="font-title text-xl font-bold text-gold flex items-center gap-1.5">
                    <MapPin className="w-5 h-5 text-terracotta" />
                    Uribia, La Guajira
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 text-sand-muted/50 text-[10px] uppercase tracking-widest z-10 pointer-events-none">
          <span className="animate-bounce">▼</span>
          <span>Desliza para adentrarte</span>
        </div>
      </section>

      {/* ================= 2. CATALOGO DESTACADO ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-gold font-title block">Exhibición de Lujo</span>
          <h2 className="font-title font-black text-4xl text-sand">Nuestra Colección</h2>
          <p className="text-sm text-sand-muted leading-relaxed font-medium">
            Obras maestras de un solo hilo con los colores tradicionales de la paleta sagrada y patrones geométricos inspirados en nuestros tótems.
          </p>
          <WayuuDivider className="opacity-30" />
        </div>

        {/* Grid de productos destacados */}
        <ProductGrid onlyFeatured={true} />

        <div className="flex justify-center pt-4">
          <Link
            href="/catalogo"
            className="flex items-center space-x-2 border-2 border-white/15 hover:border-gold hover:text-gold text-sand px-8 py-3.5 rounded-full font-bold transition-all duration-300 text-xs uppercase tracking-wider backdrop-blur-sm"
          >
            <span>Ver Colección Completa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ================= 4. STORYTELLING RANCHERÍA ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface/40 border border-white/5 rounded-[32px] p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative overflow-hidden">
          {/* Fondo Kana sutil */}
          <div className="absolute inset-0 bg-kana opacity-5 z-0" />
          
          <div className="lg:col-span-7 space-y-6 relative z-10 text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-gold font-title block">Comercio Justo & Transparencia</span>
            <h2 className="font-title font-black text-3xl sm:text-4xl text-sand leading-tight">
              Tejiendo el Futuro en la Ranchería
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-sand-muted font-sans font-medium">
              En ARUNA no solo vendemos mochilas; preservamos un legado. Cada pieza es elaborada en las <b>rancherías</b> de La Guajira por tejedoras expertas que heredan la técnica de generación en generación.
            </p>
            
            {/* Impact Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-left">
              <div className="space-y-1">
                <span className="font-title font-bold text-2xl sm:text-3xl text-gold block">45+</span>
                <span className="text-[10px] text-sand-muted uppercase font-bold tracking-widest block leading-tight">Tejedoras Socias</span>
              </div>
              <div className="space-y-1">
                <span className="font-title font-bold text-2xl sm:text-3xl text-gold block">100%</span>
                <span className="text-[10px] text-sand-muted uppercase font-bold tracking-widest block leading-tight">Comercio Justo</span>
              </div>
              <div className="space-y-1">
                <span className="font-title font-bold text-2xl sm:text-3xl text-gold block flex items-center gap-1">
                  8.500
                  <Droplets className="w-4 h-4 text-caribe animate-pulse" />
                </span>
                <span className="text-[10px] text-sand-muted uppercase font-bold tracking-widest block leading-tight">Litros de Agua Donados</span>
              </div>
            </div>
          </div>

          {/* Tarjeta Visual de Yamileth Uriana */}
          <div className="lg:col-span-5 relative z-10 flex items-center justify-center">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 w-full max-w-[340px] shadow-2xl border border-white/10 text-left space-y-4">
              <div className="space-y-1">
                <span className="bg-gold/10 border border-gold/30 text-gold text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Maestra Artesana
                </span>
                <h4 className="font-title font-bold text-lg text-sand pt-2 leading-none">Yamileth Uriana</h4>
                <p className="text-[10px] text-sand-muted font-semibold uppercase tracking-widest">Comunidad de Wüinpumüin, Uribia</p>
              </div>
              <blockquote className="text-xs leading-relaxed text-sand-muted italic font-medium pt-2 border-t border-white/5">
                &quot;Tejer es conversar con nuestros ancestros. Cada mochila lleva un pedazo de mi alma y la brisa del desierto.&quot;
              </blockquote>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-sand-muted uppercase font-bold tracking-widest">
                  <span>Simulador de Tejido</span>
                  <span className="text-gold">Día 18/25</span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-white/5">
                  <div className="w-[40%] bg-terracotta h-full"></div>
                  <div className="w-[20%] bg-gold h-full"></div>
                  <div className="w-[20%] bg-caribe h-full"></div>
                </div>
                <span className="text-[9px] text-sand-muted/60 block text-right font-medium">Patrón &quot;Jalala&apos;irü&quot; en curso</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. TIMELINE / PROCESO ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-gold font-title block">El Proceso de Creación</span>
          <h2 className="font-title font-black text-4xl text-sand">Las Etapas del Hilado</h2>
          <WayuuDivider className="opacity-30" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="bg-surface/30 border border-white/5 hover:border-gold/30 p-8 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group h-full"
            >
              <span className="font-title font-black text-6xl text-white/[0.03] group-hover:text-gold/[0.04] transition-colors absolute top-4 right-4 leading-none select-none">
                {milestone.num}
              </span>
              <div className="space-y-4 pt-4">
                <h3 className="font-title font-bold text-lg text-sand group-hover:text-gold transition-colors">
                  {milestone.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-sand-muted font-sans font-medium">
                  {milestone.text}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gold/40 pt-6 block">
                Fase {milestone.num}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 6. PREGUNTAS FRECUENTES (FAQ) ================= */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-gold font-title block">Dudas Comunes</span>
          <h2 className="font-title font-black text-4xl text-sand">Preguntas Frecuentes</h2>
          <WayuuDivider className="opacity-30" />
        </div>

        <div className="space-y-4 text-left">
          {siteConfig.faqs.map((faq, index) => (
            <details
              key={index}
              className="group border border-white/5 rounded-2xl bg-surface/30 hover:border-gold/30 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between p-5 font-title font-bold text-base text-sand cursor-pointer select-none focus:outline-none">
                <span>{faq.question}</span>
                <span className="ml-1.5 flex-shrink-0 p-1 text-sand-muted group-open:text-gold group-hover:text-gold transition-colors">
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
              <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-sand-muted leading-relaxed font-sans font-medium border-t border-white/5">
                <p className="pt-4">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
