"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Clock, MapPin, Droplets, ShieldCheck, HeartHandshake } from "lucide-react";
import { siteConfig } from "@/config/site";
import ProductGrid from "@/components/ProductGrid";
import {
  ColibriIcon,
  FlamencoIcon,
  CardenalIcon,
  CactusIcon,
  DelfinIcon,
  WayuuDivider
} from "@/components/FaunaFloraIcons";
import { getGeneralWhatsappLink } from "@/lib/utils";

export default function HomePage() {
  const whatsappUrl = getGeneralWhatsappLink();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Animaciones para el Hero
  const heroContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  // Categorías circulares inspiradas en Misolé pero auténticas de La Guajira
  const categories = [
    { id: "colibri", name: "Colibrí", wayuu: "Susu", desc: "Viento y Espíritu", icon: ColibriIcon, color: "text-flamenco border-flamenco/20" },
    { id: "flamenco", name: "Flamenco", wayuu: "Jalala", desc: "Laguna y Elegancia", icon: FlamencoIcon, color: "text-flamenco border-flamenco/20" },
    { id: "cardenal", name: "Cardenal", wayuu: "Pichi", desc: "Canto y Ranchería", icon: CardenalIcon, color: "text-cardenal border-cardenal/20" },
    { id: "cactus", name: "Cactus", wayuu: "Iguaraya", desc: "Dunas y Cardón", icon: CactusIcon, color: "text-cactus border-cactus/20" },
    { id: "delfin", name: "Delfín", wayuu: "Kaarai", desc: "Mar Caribe", icon: DelfinIcon, color: "text-caribe border-caribe/20" },
  ];

  // Pasos de la Ranchería
  const milestones = [
    {
      num: "01",
      title: "El Hilo Sagrado",
      text: "Se seleccionan y preparan hilos de algodón mercerizado premium, garantizando colores vibrantes y una resistencia al desgaste que dura toda una vida."
    },
    {
      num: "02",
      title: "El Baile del Crochet",
      text: "Se teje a un solo hilo usando agujas ultrafinas de 0.6mm. Esto requiere una tensión y concentración extremas que toma hasta 25 días completar."
    },
    {
      num: "03",
      title: "Tejer el Alma",
      text: "Al trazar los Kanas (figuras geométricas), la artesana teje sus sueños, su clan familiar y su conexión mística con los animales tótems del desierto."
    },
    {
      num: "04",
      title: "Comercio de Impacto",
      text: "Cada mochila financia proyectos de suministro de agua potable y pozos artesanales en las rancherías vulnerables de Uribia, La Guajira."
    }
  ];

  return (
    <div className="space-y-24 pb-24 relative overflow-hidden bg-obsidian text-sand font-sans">
      
      {/* GLOWS AMBIENTALES DE LA GUAJIRA */}
      <div className="ambient-glow bg-sunset-glow top-[-10vw] right-[-10vw] opacity-10" />
      <div className="ambient-glow bg-ocean-glow top-[50vh] left-[-20vw] opacity-10" />

      {/* ================= 1. HERO MAJESTUOSO & BOUTIQUE ================= */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Imagen del Hero con parallax sutil en background */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-zoomBg z-0 opacity-30 select-none pointer-events-none"
          style={{ backgroundImage: "url('/images/aruna_hero.png')" }}
        />
        {/* Máscara de color degradado natural */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/90 to-transparent z-0" />
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
            <motion.div variants={heroItem} className="inline-flex items-center space-x-2 bg-surface-card/60 px-4 py-1.5 rounded-full border border-cream-dark/25 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-ping"></span>
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-terracotta font-title">
                ✦ 100% Auténtico Hecho a Mano · La Guajira
              </span>
            </motion.div>

            {/* Título Principal */}
            <motion.h1
              variants={heroItem}
              className="font-title font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-chocolate"
            >
              El Legado Ancestral <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta via-desert-rose to-caribe italic font-normal">
                Tejido a un Solo Hilo
              </span>
            </motion.h1>

            {/* Descripción */}
            <motion.p
              variants={heroItem}
              className="text-sm sm:text-base text-chocolate-light max-w-xl leading-relaxed font-medium"
            >
              ARUNA fusiona el lujo contemporáneo con la mística y los mitos de la comunidad Wayuu. Mochilas exclusivas de hebra fina tejidas por maestras artesanas, inspiradas por el viento del Cabo de la Vela y las arenas de Taroa.
            </motion.p>

            {/* Botones de acción */}
            <motion.div variants={heroItem} className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/catalogo"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-terracotta to-desert-rose text-white py-3.5 px-8 rounded-full font-bold hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-md shadow-terracotta/10 uppercase text-xs tracking-wider"
              >
                <span>Explorar Galería</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-surface/65 border border-cream-dark text-chocolate py-3.5 px-8 rounded-full font-bold hover:bg-surface-card hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-wider backdrop-blur-md"
              >
                <span>Asesoría Personalizada</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Widget lateral boutique */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lg:col-span-4 hidden lg:block"
          >
            <div className="glass-panel rounded-3xl p-6 shadow-2xl relative z-10 max-w-[280px] ml-auto space-y-6">
              <div className="space-y-5 text-left text-chocolate">
                <div>
                  <span className="text-[9px] text-chocolate-light uppercase font-bold tracking-widest block mb-0.5">Tiempo de Tejido</span>
                  <span className="font-title text-lg font-bold text-terracotta flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5" />
                    25 a 30 Días
                  </span>
                </div>
                <div className="h-[1px] bg-cream-dark/30" />
                <div>
                  <span className="text-[9px] text-chocolate-light uppercase font-bold tracking-widest block mb-0.5">Técnica Wayuu</span>
                  <span className="font-title text-lg font-bold text-terracotta flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5" />
                    Un Solo Hilo (Fina Hebra)
                  </span>
                </div>
                <div className="h-[1px] bg-cream-dark/30" />
                <div>
                  <span className="text-[9px] text-chocolate-light uppercase font-bold tracking-widest block mb-0.5">Procedencia</span>
                  <span className="font-title text-lg font-bold text-terracotta flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5" />
                    Alta Guajira, Colombia
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= 2. NAVEGACIÓN DE TÓTEMS (Estilo Misolé Categorías) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-terracotta font-title block">
            Colección por Inspiración
          </span>
          <h2 className="font-title font-black text-3xl text-chocolate">
            Los Simbolos Sagrados de La Guajira
          </h2>
          <p className="text-xs sm:text-sm text-chocolate-light max-w-md mx-auto font-medium">
            Cada símbolo representa un fragmento de nuestra fauna mística, mitología y territorio guajiro.
          </p>
        </div>

        {/* Fila de Categorías Circulares */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 pt-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href="/catalogo"
                className="group flex flex-col items-center space-y-3 cursor-pointer select-none"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface border-2 border-cream-dark/40 flex items-center justify-center shadow-sm group-hover:border-terracotta group-hover:shadow-md transition-all duration-300 active:scale-95 relative overflow-hidden`}>
                  {/* Fondo circular decorativo */}
                  <div className="absolute inset-0 bg-kana opacity-5 z-0" />
                  <Icon size={38} className={`relative z-10 ${cat.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <div className="text-center">
                  <h3 className="font-title font-bold text-xs sm:text-sm text-chocolate leading-none">
                    {cat.name}
                  </h3>
                  <span className="text-[8px] sm:text-[9px] text-chocolate-light font-bold uppercase tracking-widest block pt-1">
                    &quot;{cat.wayuu}&quot;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <WayuuDivider className="opacity-15 max-w-xs mx-auto pt-6" />
      </section>

      {/* ================= 3. EXPOSICIÓN DE ARTE COMPLETA ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-terracotta font-title block">Exhibición Boutique</span>
          <h2 className="font-title font-black text-4xl text-chocolate">Mochilas Destacadas</h2>
          <p className="text-xs sm:text-sm text-chocolate-light leading-relaxed font-medium">
            Obras maestras de hebra fina con patrones geométricos ancestrales y combinaciones de tintes naturales que relatan historias vivas.
          </p>
        </div>

        {/* Grid de productos destacados interactivo */}
        <ProductGrid onlyFeatured={true} />

        <div className="flex justify-center pt-4">
          <Link
            href="/catalogo"
            className="flex items-center space-x-2 border border-cream-dark hover:border-terracotta hover:text-terracotta text-chocolate px-8 py-3.5 rounded-full font-bold transition-all duration-300 text-xs uppercase tracking-wider backdrop-blur-sm shadow-sm"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ================= 4. LEYENDA ANCESTRAL (Mito de Wale' Kerü) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-cream-dark/30 rounded-[32px] p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative overflow-hidden">
          {/* Fondo de Tapiz Wayuu sutil */}
          <div className="absolute inset-0 bg-kana opacity-[0.06] z-0" />
          
          <div className="lg:col-span-7 space-y-6 relative z-10 text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-terracotta font-title block">La Cosmovisión del Tejido</span>
            <h2 className="font-title font-black text-3xl sm:text-4xl text-chocolate leading-tight">
              La Leyenda Sagrada <br /> de Wale&apos; Kerü
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-chocolate-light font-medium">
              Cuenta la tradición que la araña mitológica <b>Wale&apos; Kerü</b> reveló el arte de tejer a las primeras mujeres Wayuu bajo el destello de la luna. Wale&apos; Kerü trazaba fajas y mochilas de belleza inmaculada con patrones nunca antes vistos. 
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-chocolate-light font-medium">
              Una joven, fascinada, le suplicó que le enseñara sus secretos. La araña accedió a cambio de una única condición: tejer en absoluto respeto y contemplación, pues cada puntada es un pensamiento del alma. Desde entonces, cada mochila representa un rito sagrado y la identidad de nuestra cultura.
            </p>

            {/* Impact Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-left border-t border-cream-dark/30 mt-6">
              <div className="space-y-1">
                <span className="font-title font-bold text-2xl sm:text-3xl text-terracotta block">45+</span>
                <span className="text-[9px] text-chocolate-light uppercase font-bold tracking-widest block leading-tight">Artesanas Socias</span>
              </div>
              <div className="space-y-1">
                <span className="font-title font-bold text-2xl sm:text-3xl text-terracotta block">100%</span>
                <span className="text-[9px] text-chocolate-light uppercase font-bold tracking-widest block leading-tight">Pago Justo Directo</span>
              </div>
              <div className="space-y-1">
                <span className="font-title font-bold text-2xl sm:text-3xl text-terracotta block flex items-center gap-1">
                  8.500L
                  <Droplets className="w-3.5 h-3.5 text-caribe animate-pulse" />
                </span>
                <span className="text-[9px] text-chocolate-light uppercase font-bold tracking-widest block leading-tight">Agua Potable Donada</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Yamileth Uriana (Weaver Card) */}
          <div className="lg:col-span-5 relative z-10 flex items-center justify-center">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 w-full max-w-[340px] shadow-2xl border border-cream-dark/20 text-left space-y-4">
              <div className="space-y-1">
                <span className="bg-terracotta/10 border border-terracotta/20 text-terracotta text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Maestra Artesana
                </span>
                <h4 className="font-title font-bold text-lg text-chocolate pt-2 leading-none">Yamileth Uriana</h4>
                <p className="text-[9px] text-chocolate-light font-bold uppercase tracking-widest">Comunidad de Wüinpumüin, Uribia</p>
              </div>
              <blockquote className="text-xs leading-relaxed text-chocolate-light italic font-medium pt-2 border-t border-cream-dark/20">
                &quot;Tejer es conversar con nuestros ancestros. Cada mochila lleva un pedazo de mi alma y la brisa del desierto.&quot;
              </blockquote>
              <div className="bg-surface p-4 rounded-2xl border border-cream-dark/30 space-y-2">
                <div className="flex justify-between items-center text-[9px] text-chocolate-light uppercase font-bold tracking-widest">
                  <span>Telar en Curso</span>
                  <span className="text-terracotta">Día 18/25</span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-cream-dark/30">
                  <div className="w-[40%] bg-terracotta h-full"></div>
                  <div className="w-[20%] bg-caribe h-full"></div>
                  <div className="w-[20%] bg-cardenal h-full"></div>
                </div>
                <span className="text-[9px] text-chocolate-light/60 block text-right font-medium">Patrón &quot;Jalala&apos;irü&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. TIMELINE / PROCESO ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-terracotta font-title block">El Arte del Hilado</span>
          <h2 className="font-title font-black text-4xl text-chocolate">El Riguroso Proceso</h2>
          <WayuuDivider className="opacity-15 max-w-xs mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="bg-surface border border-cream-dark/35 hover:border-terracotta/40 p-8 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group h-full"
            >
              <span className="font-title font-black text-6xl text-chocolate/[0.03] group-hover:text-terracotta/[0.04] transition-colors absolute top-4 right-4 leading-none select-none">
                {milestone.num}
              </span>
              <div className="space-y-4 pt-4">
                <h3 className="font-title font-bold text-base text-chocolate group-hover:text-terracotta transition-colors">
                  {milestone.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-chocolate-light font-medium">
                  {milestone.text}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-terracotta/55 pt-6 block">
                Fase {milestone.num}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 6. LUXURY TRUST BADGES (Boutique Row) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-cream-dark/30 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="p-3 bg-terracotta/10 rounded-2xl flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-terracotta" />
            </div>
            <div className="space-y-1">
              <h4 className="font-title font-bold text-sm text-chocolate uppercase tracking-wide">
                Garantía de Autenticidad
              </h4>
              <p className="text-xs text-chocolate-light leading-relaxed font-medium">
                Cada mochila incluye certificado firmado por la artesana y su clan familiar tradicional.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="p-3 bg-caribe/10 rounded-2xl flex-shrink-0">
              <HeartHandshake className="w-6 h-6 text-caribe" />
            </div>
            <div className="space-y-1">
              <h4 className="font-title font-bold text-sm text-chocolate uppercase tracking-wide">
                Impacto Directo y Justo
              </h4>
              <p className="text-xs text-chocolate-light leading-relaxed font-medium">
                Modelo directo sin intermediarios, devolviendo el 70% del valor total a la tejedora original.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="p-3 bg-cardenal/10 rounded-2xl flex-shrink-0">
              <Droplets className="w-6 h-6 text-cardenal" />
            </div>
            <div className="space-y-1">
              <h4 className="font-title font-bold text-sm text-chocolate uppercase tracking-wide">
                Proyecto Social de Agua
              </h4>
              <p className="text-xs text-chocolate-light leading-relaxed font-medium">
                Financiamos pozos de agua y el suministro de camiones cisterna directamente en las rancherías.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
