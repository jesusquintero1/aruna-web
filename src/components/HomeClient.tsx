"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Truck, Sparkles, HeartHandshake, ShieldCheck, Quote, Clock, Flame,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { type Producto } from "@/data/productos";
import { simbolosData } from "@/data/simbolos";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";

interface HomeClientProps {
  featured: Producto[];
  disponibles: number;
}

export default function HomeClient({ featured, disponibles }: HomeClientProps) {
  const heroSlides = [
    { img: "/images/mochila_flamenco.png" },
    { img: "/images/mochila_cardenal.png" },
    { img: "/images/mochila_iguaraya.png" },
  ];
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const [review, setReview] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setReview((r) => (r + 1) % siteConfig.testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Cuenta regresiva de urgencia (termina a medianoche)
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTime({
        h: Math.floor(diff / 3.6e6),
        m: Math.floor((diff % 3.6e6) / 6e4),
        s: Math.floor((diff % 6e4) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");

  const benefits = [
    { icon: Truck, title: "Envío gratis asegurado", desc: "A toda Colombia · 2–5 días", color: "text-caribe" },
    { icon: Sparkles, title: "Pieza irrepetible", desc: "Tejida a mano, única en el mundo", color: "text-flamenco" },
    { icon: HeartHandshake, title: "Comercio justo real", desc: "70% vuelve a la artesana", color: "text-terracotta" },
    { icon: ShieldCheck, title: "Autenticidad garantizada", desc: "Certificado de origen Wayuu", color: "text-gold-lux" },
  ];

  const avatars = featured.slice(0, 4);

  return (
    <div className="pb-24 overflow-hidden relative z-[2]">

      {/* ================= 1. HERO DE LUJO ================= */}
      <section className="relative bg-ink-lux overflow-hidden">
        <div className="ambient-glow bg-gold-glow top-[-15vw] right-[-5vw] opacity-25" />
        <div className="ambient-glow bg-ocean-glow bottom-[-20vw] left-[-10vw] opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Texto */}
          <Reveal stagger className="text-white space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 border border-gold-lux/40 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]">
              <span className="shimmer-gold font-black">Maison artesanal · La Guajira</span>
            </span>
            <h1 className="font-lux font-bold text-4xl sm:text-5xl lg:text-[4.2rem] leading-[1.05] tracking-tight">
              El arte de llevar
              <span className="block italic text-gradient-gold">una historia tejida.</span>
            </h1>
            <p className="text-white/75 text-base sm:text-lg font-light max-w-md mx-auto lg:mx-0 leading-relaxed">
              Mochilas Wayuu de alta artesanía, tejidas a mano durante semanas en La Guajira. Piezas únicas que no volverás a ver en nadie más.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Link href="/catalogo" className="btn-gold px-8 py-4 text-sm uppercase tracking-wider">
                Descubrir la colección <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/historia" className="inline-flex items-center justify-center gap-2 border border-white/25 hover:border-white/60 text-white font-semibold px-7 py-4 rounded-full text-sm uppercase tracking-wider transition-all">
                Nuestra historia
              </Link>
            </div>
            {/* Prueba social */}
            <div className="flex items-center gap-4 justify-center lg:justify-start pt-3">
              <div className="flex -space-x-3">
                {avatars.map((p) => (
                  <div key={p.id} className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-carbon">
                    <Image src={p.imagenes[0]} alt="" fill className="object-cover" sizes="36px" />
                  </div>
                ))}
              </div>
              <div className="text-left leading-none">
                <div className="text-sol text-sm">★★★★★</div>
                <p className="text-white/70 text-xs font-medium mt-1">
                  <CountUp to={1240} suffix="+" className="font-bold text-white" /> clientes en 14 países
                </p>
              </div>
            </div>
          </Reveal>

          {/* Imagen */}
          <Reveal delay={0.15} className="relative h-[380px] sm:h-[480px] lg:h-[540px]">
            <div className="absolute -top-4 -left-4 z-30 w-24 h-24 animate-spin-slow hidden sm:block">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <path id="circlePath" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                </defs>
                <text className="fill-gold-soft" style={{ fontSize: "10px", letterSpacing: "3px", fontWeight: 700 }}>
                  <textPath href="#circlePath">HECHO A MANO · 100% ORIGINAL · </textPath>
                </text>
              </svg>
              <Sparkles className="w-5 h-5 text-gold-soft absolute inset-0 m-auto" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-gold-lux/30 shadow-2xl">
                  <div className="absolute inset-0 animate-zoomBg">
                    <Image
                      src={heroSlides[slide].img}
                      alt="Mochila Wayuu Arüna de alta artesanía"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon/50 via-transparent to-transparent" />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute -bottom-4 left-2 sm:left-6 glass-panel rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 z-20 animate-float">
              <Flame className="w-5 h-5 text-flamenco" />
              <div className="leading-none">
                <p className="text-xs font-black text-chocolate">Edición limitada</p>
                <p className="text-[11px] text-chocolate-light font-semibold">Solo {disponibles} piezas disponibles</p>
              </div>
            </div>
            <div className="absolute bottom-6 right-3 flex gap-1.5 z-20">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? "bg-gold-lux w-7" : "bg-white/40 w-3"}`} aria-label={`Imagen ${i + 1}`} />
              ))}
            </div>
          </Reveal>
        </div>

        <div className="h-1.5 bg-kana-border opacity-70" />
      </section>

      {/* ================= 2. BARRA DE URGENCIA ================= */}
      <section className="bg-carbon text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1 text-center">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="w-4 h-4 text-gold-soft" />
            Envío gratis garantizado solo por hoy
          </span>
          <span className="flex items-center gap-1.5 font-mono font-bold text-gold-soft tracking-widest">
            {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
          </span>
        </div>
      </section>

      {/* ================= 3. BENEFICIOS ================= */}
      <section className="bg-white border-b border-cream-dark">
        <Reveal stagger className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-y-2">
          {benefits.map((b, i) => (
            <div key={i} className={`flex items-center gap-3 py-6 px-3 sm:px-5 justify-center sm:justify-start ${i > 0 ? "lg:border-l lg:border-cream-dark" : ""}`}>
              <b.icon className={`w-7 h-7 flex-shrink-0 ${b.color}`} />
              <div className="leading-tight text-left">
                <p className="font-title font-extrabold text-sm text-chocolate">{b.title}</p>
                <p className="text-[11px] text-chocolate-light font-semibold">{b.desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ================= 4. PRODUCTOS DESTACADOS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 space-y-10">
        <Reveal className="text-center space-y-3">
          <span className="text-xs uppercase font-black tracking-[0.3em] text-gold-deep">La colección</span>
          <h2 className="font-lux font-bold text-4xl sm:text-5xl text-chocolate">
            Tu <span className="italic text-gradient-vibrante">pieza única</span> te espera
          </h2>
          <p className="text-chocolate-light font-light max-w-lg mx-auto">
            Solo existe una de cada mochila. Cuando encuentra a su dueña, desaparece para siempre.
          </p>
        </Reveal>

        <ProductGrid onlyFeatured={true} products={featured} />

        <Reveal className="flex justify-center pt-2">
          <Link href="/catalogo" className="btn-secondary px-8 py-4 text-sm uppercase tracking-wider">
            Ver todo el catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>

      {/* ================= 5. SÍMBOLOS SAGRADOS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-10">
        <Reveal className="text-center space-y-3">
          <span className="text-xs uppercase font-black tracking-[0.3em] text-caribe">Simbología ancestral</span>
          <h2 className="font-lux font-bold text-4xl sm:text-5xl text-chocolate">Elige por su significado</h2>
          <p className="text-chocolate-light font-light max-w-lg mx-auto">Cada Kana cuenta una historia. Encuentra la que resuena contigo.</p>
        </Reveal>
        <Reveal stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(simbolosData).map(([key, s]) => (
            <Link
              key={key}
              href="/catalogo"
              className="group flex flex-col items-center text-center gap-2 bg-white border border-cream-dark rounded-2xl p-5 hover:border-gold-lux hover:-translate-y-1.5 transition-all duration-500"
            >
              <div className="p-3 bg-cream rounded-xl group-hover:bg-caribe-light transition-colors duration-500">
                {React.createElement(s.icon, { size: 30, className: s.class })}
              </div>
              <span className="font-title font-extrabold text-sm text-chocolate leading-none">{s.name}</span>
              <span className="text-[10px] text-chocolate-light font-bold uppercase tracking-wide leading-none">{s.tag}</span>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* ================= 6. STORYTELLING (sección oscura de lujo) ================= */}
      <section className="pt-24">
        <div className="bg-ink-lux relative overflow-hidden">
          <div className="ambient-glow bg-sunset-glow top-[10%] right-[-10%] opacity-20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <Reveal className="relative h-[340px] lg:h-[460px] order-2 lg:order-1">
              <div className="relative w-full h-full rounded-[36px] overflow-hidden border border-gold-lux/25 shadow-2xl">
                <Image src="/images/aruna_hero.png" alt="Maestra tejedora Wayuu de La Guajira" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
            </Reveal>
            <Reveal stagger className="text-white space-y-6 order-1 lg:order-2">
              <span className="text-xs uppercase font-black tracking-[0.3em] text-gold-deep">El alma detrás del tejido</span>
              <h2 className="font-lux font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
                Cada mochila guarda <span className="italic text-gradient-gold">semanas de manos sabias</span>
              </h2>
              <p className="text-white/70 font-light leading-relaxed">
                {siteConfig.culture.text}
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="font-lux font-bold text-3xl sm:text-4xl text-gold-soft"><CountUp to={30} suffix="" /></p>
                  <p className="text-[11px] text-white/60 font-bold uppercase tracking-wide">días por pieza</p>
                </div>
                <div>
                  <p className="font-lux font-bold text-3xl sm:text-4xl text-gold-soft"><CountUp to={70} suffix="%" /></p>
                  <p className="text-[11px] text-white/60 font-bold uppercase tracking-wide">para la artesana</p>
                </div>
                <div>
                  <p className="font-lux font-bold text-3xl sm:text-4xl text-gold-soft"><CountUp to={100} suffix="%" /></p>
                  <p className="text-[11px] text-white/60 font-bold uppercase tracking-wide">hecho a mano</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= 7. TESTIMONIOS ================= */}
      <section className="max-w-3xl mx-auto px-4 pt-24 text-center space-y-8">
        <Reveal className="space-y-3">
          <span className="text-xs uppercase font-black tracking-[0.3em] text-flamenco">Voces reales</span>
          <h2 className="font-lux font-bold text-4xl sm:text-5xl text-chocolate">Historias que enamoran</h2>
        </Reveal>
        <Reveal className="relative bg-white border-gold-lux rounded-[32px] p-8 sm:p-12 shadow-sm">
          <Quote className="w-10 h-10 text-gold-lux/30 mx-auto mb-4" />
          <AnimatePresence mode="wait">
            <motion.div
              key={review}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="text-sol text-lg">{"★".repeat(siteConfig.testimonials[review].stars)}</div>
              <p className="font-lux text-xl sm:text-2xl text-chocolate font-medium leading-relaxed italic">
                &quot;{siteConfig.testimonials[review].text}&quot;
              </p>
              <div>
                <p className="font-title font-extrabold text-chocolate">{siteConfig.testimonials[review].name}</p>
                <p className="text-xs text-chocolate-light font-bold uppercase tracking-wide">{siteConfig.testimonials[review].location}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 pt-6">
            {siteConfig.testimonials.map((_, i) => (
              <button key={i} onClick={() => setReview(i)} className={`h-2 rounded-full transition-all ${i === review ? "bg-gold-lux w-6" : "bg-cream-dark w-2"}`} aria-label={`Testimonio ${i + 1}`} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ================= 8. FAQ ================= */}
      <section className="max-w-3xl mx-auto px-4 pt-24 space-y-8">
        <Reveal className="text-center space-y-3">
          <span className="text-xs uppercase font-black tracking-[0.3em] text-caribe">Sin dudas</span>
          <h2 className="font-lux font-bold text-4xl sm:text-5xl text-chocolate">Preguntas frecuentes</h2>
        </Reveal>
        <Reveal stagger className="space-y-3">
          {siteConfig.faqs.slice(0, 5).map((faq, i) => (
            <details key={i} className="group bg-white border border-cream-dark rounded-2xl hover:border-gold-lux transition-all duration-500 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-5 font-title font-bold text-sm text-chocolate cursor-pointer select-none">
                <span>{faq.question}</span>
                <svg className="w-5 h-5 text-gold-lux transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-chocolate-light leading-relaxed font-medium border-t border-cream-dark pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </Reveal>
      </section>

      {/* ================= 9. CTA FINAL ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Reveal className="relative bg-ink-lux rounded-[40px] p-10 sm:p-20 text-center overflow-hidden">
          <div className="ambient-glow bg-gold-glow top-[-20vw] left-[30%] opacity-25" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto text-white">
            <span className="text-xs uppercase font-black tracking-[0.3em] shimmer-gold">Edición limitada</span>
            <h2 className="font-lux font-bold text-3xl sm:text-5xl leading-tight">
              Llévate una obra de arte <span className="italic text-gradient-gold">antes de que desaparezca</span>
            </h2>
            <p className="text-white/70 font-light max-w-md mx-auto">
              Cada mochila es irrepetible. Encuentra la tuya hoy con envío gratis a toda Colombia.
            </p>
            <Link href="/catalogo" className="btn-gold px-10 py-4 text-sm uppercase tracking-wider">
              Explorar la colección <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
