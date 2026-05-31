"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Producto } from "@/data/productos";
import { formatPrice, getProductWhatsappLink } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, MessageCircle, ArrowLeft, Shield, Sparkles, HeartHandshake, Truck, Check, Info } from "lucide-react";
import { motion } from "framer-motion";
import { WayuuDivider } from "@/components/FaunaFloraIcons";

interface ProductDetailsClientProps {
  producto: Producto;
  productosRelacionados: Producto[];
}

export default function ProductDetailsClient({ producto, productosRelacionados }: ProductDetailsClientProps) {
  const [activeImage, setActiveImage] = useState(producto.imagenes[0]);
  const { addToCart } = useCart();
  const whatsappLink = getProductWhatsappLink(producto);

  // Determinar dinámicamente el tamaño y capacidad de la mochila (Fiel a la UX de Ben & Frank)
  const isMini = producto.id.toLowerCase().includes("mini") || producto.id.toLowerCase().includes("sususu");
  const dimensions = isMini ? "20 cm x 18 cm x 15 cm" : "32 cm x 28 cm x 22 cm";
  
  const capacityItems = [
    { name: "Smartphone", fits: true, desc: "Cualquier modelo" },
    { name: "Monedero / Tarjetero", fits: true, desc: "Bolsillo principal" },
    { name: "Cosméticos y Llaves", fits: true, desc: "Acceso inmediato" },
    { name: "Gafas de Sol", fits: true, desc: "Con estuche" },
    { name: "Libro o Agenda A5", fits: !isMini, desc: "Tamaño estándar" },
    { name: "Botella de Agua", fits: !isMini, desc: "Hasta 750ml" },
    { name: "iPad o Tablet", fits: !isMini, desc: "Hasta 11 pulgadas" },
    { name: "Laptop 13\"", fits: !isMini && !producto.nombre.includes("Sususu"), fitsDetail: "Encaja justo", desc: "Ultrabook compacto" },
  ];

  // Paleta de pigmentos naturales e hilos de este producto (Estilo Sajú Material Palette)
  const naturalDyes = [
    { name: "Terracota Arcilla", hex: "#c96541", desc: "Ocre natural obtenido de la tierra de Uribia" },
    { name: "Arena del Desierto", hex: "#FAF7F2", border: true, desc: "Algodón crudo natural sin decolorar" },
    { name: "Cardenal Carmín", hex: "#c1272d", desc: "Rojo intenso inspirado en el plumaje del cardenal guajiro" },
    { name: "Azul Olas del Caribe", hex: "#1f8a94", desc: "Indigo vegetal que refleja el mar de Cabo de la Vela" }
  ];

  // Biografía de la artesana asociada (Estilo Storytelling Mercedes Salazar)
  const artisanProfiles: Record<string, { name: string, clan: string, experience: string, bio: string }> = {
    "mochila-arutka-cardenal": {
      name: "Yamileth Uriana",
      clan: "Uriana (Clan del tigre y el desierto)",
      experience: "22 Años",
      bio: "Yamileth es maestra tejedora de la ranchería Wüinpumüin en Uribia. Su especialidad es el crochet ultrafino de un solo hilo, técnica que aprendió de su abuela a los 8 años. Es conocida en su comunidad por la simetría matemática con la que traza los Kanas."
    },
    "mochila-iguaraya-desierto": {
      name: "Juana Pushaina",
      clan: "Pushaina (Clan de la tierra y los cardones)",
      experience: "30 Años",
      bio: "Juana reside en una ranchería a las afueras de Manaure. Utiliza tintes orgánicos extraídos de cortezas de árboles y plantas locales. Sus tejidos representan los sueños y mitos de su linaje familiar."
    },
    "mochila-caribe-flamenco": {
      name: "María Epiayú",
      clan: "Epiayú (Clan del halcón y el viento)",
      experience: "15 Años",
      bio: "María es una tejedora joven que mezcla diseños tradicionales con contrastes contemporáneos. Teje siempre bajo la enramada de su rancho, sintiendo la brisa del Caribe colombiano."
    }
  };

  const defaultArtisan = {
    name: "Margoth Fontalvo",
    clan: "Pushaina (Tradición y Linaje)",
    experience: "18 Años",
    bio: "Margoth lidera el taller de tejedoras de ARUNA en la Alta Guajira. Custodia las técnicas tradicionales de hilado y asegura que el 70% de cada venta retorne íntegramente a las artesanas que confeccionan cada obra."
  };

  const artisan = artisanProfiles[producto.id] || defaultArtisan;

  return (
    <div className="space-y-12">
      {/* Botón Volver */}
      <div className="text-left">
        <Link
          href="/catalogo"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-chocolate-light hover:text-terracotta transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* COLUMNA IZQUIERDA: Galería de Imágenes (Boutique Framed) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] bg-surface border border-cream-dark/35 rounded-[24px] overflow-hidden shadow-sm">
            <Image
              src={activeImage}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {producto.disponible ? (
                <span className="bg-terracotta text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-md shadow">
                  Pieza Única
                </span>
              ) : (
                <span className="bg-chocolate/85 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-md shadow backdrop-blur-sm">
                  Agotada
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {producto.imagenes.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
              {producto.imagenes.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 bg-surface rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImage === img ? "border-terracotta shadow" : "border-cream-dark/30 hover:border-cream-dark"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${producto.nombre} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Detalles del Producto & Conversión (Estilo Misolé) */}
        <div className="lg:col-span-5 text-left space-y-6">
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-terracotta">
              {producto.categoria}
            </span>
            <h1 className="font-title font-black text-3xl sm:text-4xl text-chocolate leading-none">
              {producto.nombre}
            </h1>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {producto.colores.map((col, idx) => (
                <span
                  key={idx}
                  className="bg-surface text-chocolate-light text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-cream-dark/30"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Precios */}
          <div className="flex items-baseline space-x-3 bg-surface p-4.5 rounded-2xl border border-cream-dark/30 w-fit">
            <span className="text-2xl sm:text-3xl font-bold text-chocolate font-mono">
              {formatPrice(producto.precio)}
            </span>
            {producto.precioAnterior && (
              <span className="text-xs sm:text-sm text-chocolate-light/50 line-through font-mono">
                {formatPrice(producto.precioAnterior)}
              </span>
            )}
          </div>

          {/* Descripción Completa */}
          <div className="space-y-2 border-t border-cream-dark/30 pt-4">
            <h3 className="font-title font-bold text-xs text-chocolate uppercase tracking-wider">
              Historia de esta pieza
            </h3>
            <p className="text-xs sm:text-sm text-chocolate-light leading-relaxed font-semibold">
              {producto.descripcion}
            </p>
          </div>

          {/* ================= A. PALETA DE HILOS Y TINTES (Sajú Style) ================= */}
          <div className="space-y-3 bg-surface p-5 rounded-[20px] border border-cream-dark/25">
            <h4 className="font-title font-bold text-xs text-chocolate uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-terracotta" />
              Paleta de Tintes e Hilos
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {naturalDyes.map((dye, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 shadow-inner ${
                      dye.border ? "border border-cream-dark" : ""
                    }`}
                    style={{ backgroundColor: dye.hex }}
                  />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-chocolate leading-none block">{dye.name}</span>
                    <span className="text-[8px] text-chocolate-light leading-tight block font-medium">{dye.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Señales de Confianza del Producto */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-cream-dark/30">
            <div className="flex items-start space-x-3 text-[11px] font-semibold text-chocolate-light">
              <Sparkles className="w-4.5 h-4.5 text-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-chocolate uppercase tracking-wide text-[10px]">Tejido de Autor</h4>
                <p className="text-[10px]">Hecho a un solo hilo</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-[11px] font-semibold text-chocolate-light">
              <HeartHandshake className="w-4.5 h-4.5 text-caribe flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-chocolate uppercase tracking-wide text-[10px]">Comercio 100% Directo</h4>
                <p className="text-[10px]">Pago justo garantizado</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-[11px] font-semibold text-chocolate-light">
              <Truck className="w-4.5 h-4.5 text-cactus flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-chocolate uppercase tracking-wide text-[10px]">Envío Nacional Gratis</h4>
                <p className="text-[10px]">Colombia (2-5 días)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-[11px] font-semibold text-chocolate-light">
              <Shield className="w-4.5 h-4.5 text-cardenal flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-chocolate uppercase tracking-wide text-[10px]">Masterpiece Única</h4>
                <p className="text-[10px]">Nunca habrá otra igual</p>
              </div>
            </div>
          </div>

          {/* Botones de Acción de Compra */}
          <div className="space-y-3 pt-2">
            {producto.disponible ? (
              <>
                {/* Botón WhatsApp */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-[#25D366] text-white py-4 rounded-full font-bold hover:bg-[#20ba5a] active:scale-95 transition-all duration-300 shadow-md uppercase text-xs tracking-wider"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-current" />
                  <span>Pedir directo por WhatsApp</span>
                </a>

                {/* Botón Carrito */}
                <button
                  onClick={() => addToCart(producto)}
                  className="w-full flex items-center justify-center space-x-2 border-2 border-chocolate text-chocolate hover:bg-chocolate hover:text-white py-4 rounded-full font-bold active:scale-95 transition-all duration-300 uppercase text-xs tracking-wider shadow-inner"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>Añadir al Carrito de Compras</span>
                </button>
              </>
            ) : (
              <a
                href={getProductWhatsappLink({ ...producto, precio: 0 })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 border-2 border-cream-dark text-chocolate-light py-4 rounded-full font-bold hover:border-terracotta hover:text-terracotta transition-all duration-300 text-xs uppercase tracking-wider"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>Encargar pieza similar</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ================= B. VISUALIZADOR DE TAMAÑO & CAPACIDAD (Ben & Frank Style) ================= */}
      <section className="bg-surface border border-cream-dark/30 rounded-[24px] p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3 text-left">
          <div className="p-2.5 bg-terracotta/10 rounded-xl">
            <Info className="w-5 h-5 text-terracotta" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-terracotta font-title block">Capacidad Real</span>
            <h3 className="font-title font-black text-xl text-chocolate uppercase tracking-wide">
              ¿Qué cabe en mi mochila?
            </h3>
            <p className="text-xs text-chocolate-light font-medium">
              Dimensiones estimadas: <b className="text-chocolate">{dimensions}</b>. Mapeamos la capacidad física de esta pieza para eliminar cualquier fricción de tamaño.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {capacityItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all ${
                item.fits
                  ? "bg-terracotta-light/10 border-terracotta/15 hover:border-terracotta/40"
                  : "bg-cream-dark/5 border-cream-dark/20 opacity-40 select-none"
              }`}
            >
              <div className="flex justify-between items-center w-full leading-none">
                <span className="text-[10px] font-black uppercase tracking-wide text-chocolate">
                  {item.name}
                </span>
                {item.fits ? (
                  <Check className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                ) : (
                  <span className="text-[10px] text-chocolate-light font-bold">X</span>
                )}
              </div>
              <span className="text-[8px] sm:text-[9px] text-chocolate-light leading-none block pt-2 font-medium">
                {item.fits ? item.desc : "No recomendado"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= C. MAESTRA ARTESANA BIOGRAFÍA (Mercedes Salazar Storytelling) ================= */}
      <section className="bg-surface border border-cream-dark/30 rounded-[24px] overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left">
        <div className="md:col-span-4 relative aspect-[4/5] md:aspect-square w-full h-full bg-cream-dark/20 min-h-[220px]">
          <Image
            src="https://images.unsplash.com/photo-1528822838844-10b70d41880b?auto=format&fit=crop&q=80&w=600"
            alt={artisan.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="md:col-span-8 p-6 sm:p-8 space-y-4">
          <div className="space-y-1">
            <span className="bg-terracotta/15 text-terracotta text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-terracotta/10 inline-block leading-none">
              Maestra Tejedora Original
            </span>
            <h3 className="font-title font-black text-2xl text-chocolate">
              {artisan.name}
            </h3>
            <div className="flex gap-4 text-[9px] text-chocolate-light font-bold uppercase tracking-wider pt-0.5">
              <span>Clan: <b className="text-chocolate">{artisan.clan}</b></span>
              <span>•</span>
              <span>Experiencia: <b className="text-chocolate">{artisan.experience}</b></span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-chocolate-light leading-relaxed font-semibold">
            {artisan.bio}
          </p>
          <WayuuDivider className="opacity-15 max-w-xs pt-2" />
        </div>
      </section>

      {/* 4. PRODUCTOS RELACIONADOS */}
      {productosRelacionados.length > 0 && (
        <div className="space-y-8 pt-12 border-t border-cream-dark/30">
          <div className="text-center md:text-left space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-terracotta block">Sugerencias exclusivas</span>
            <h2 className="font-title font-black text-2xl sm:text-3xl text-chocolate">Otras Mochilas con Alma</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosRelacionados.map((prod) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-surface border border-cream-dark/30 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-terracotta/30 hover:shadow transition-all group"
              >
                <div className="relative aspect-[4/5] bg-cream-dark/10 overflow-hidden">
                  <Link href={`/producto/${prod.id}`}>
                    <Image
                      src={prod.imagenes[0]}
                      alt={prod.nombre}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>
                </div>
                <div className="p-5 flex flex-col flex-grow text-left space-y-3">
                  <div className="space-y-1">
                    <span className="text-[8px] text-chocolate-light font-bold uppercase tracking-wider block">
                      {prod.colores.slice(0, 2).join(" · ")}
                    </span>
                    <h3 className="font-title font-bold text-sm text-chocolate group-hover:text-terracotta transition-colors leading-snug truncate">
                      <Link href={`/producto/${prod.id}`}>{prod.nombre}</Link>
                    </h3>
                  </div>
                  <span className="text-sm font-semibold text-chocolate font-mono mt-auto block">
                    {formatPrice(prod.precio)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
