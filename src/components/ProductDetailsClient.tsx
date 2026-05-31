"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Producto } from "@/data/productos";
import { formatPrice, getProductWhatsappLink } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, MessageCircle, ArrowLeft, Shield, Sparkles, HeartHandshake, Truck } from "lucide-react";
import { motion } from "framer-motion";

interface ProductDetailsClientProps {
  producto: Producto;
  productosRelacionados: Producto[];
}

export default function ProductDetailsClient({ producto, productosRelacionados }: ProductDetailsClientProps) {
  const [activeImage, setActiveImage] = useState(producto.imagenes[0]);
  const { addToCart } = useCart();
  const whatsappLink = getProductWhatsappLink(producto);

  return (
    <div className="space-y-16">
      {/* Botón Volver */}
      <div className="text-left">
        <Link
          href="/catalogo"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-carbon/75 hover:text-cardenal transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Columna Izquierda: Galería de Imágenes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] bg-arena-oscura/20 rounded-2xl overflow-hidden border border-arena-oscura/35 shadow-sm">
            <Image
              src={activeImage}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10">
              {producto.disponible ? (
                <span className="bg-cardon text-arena text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                  Pieza Única
                </span>
              ) : (
                <span className="bg-carbon/80 text-arena text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-sm">
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
                  className={`relative w-20 h-20 bg-arena-oscura/20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImage === img ? "border-cardenal shadow" : "border-arena-oscura/35 hover:border-arena-oscura"
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

        {/* Columna Derecha: Detalles del Producto & Compras */}
        <div className="lg:col-span-5 text-left space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-cardenal">
              {producto.categoria}
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-carbon leading-tight">
              {producto.nombre}
            </h1>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {producto.colores.map((col, idx) => (
                <span
                  key={idx}
                  className="bg-arena-oscura/30 text-carbon/80 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-arena-oscura/20"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Precios */}
          <div className="flex items-baseline space-x-3 bg-arena-oscura/15 p-4 rounded-2xl border border-arena-oscura/25 w-fit">
            <span className="text-2xl sm:text-3xl font-bold text-carbon font-mono">
              {formatPrice(producto.precio)}
            </span>
            {producto.precioAnterior && (
              <span className="text-sm text-carbon/40 line-through font-mono">
                {formatPrice(producto.precioAnterior)}
              </span>
            )}
          </div>

          {/* Descripción Completa */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-carbon uppercase tracking-wider">
              Historia de esta pieza
            </h3>
            <p className="text-sm text-carbon/80 leading-relaxed font-sans font-medium">
              {producto.descripcion}
            </p>
          </div>

          {/* Señales de Confianza del Producto */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-arena-oscura/20">
            <div className="flex items-start space-x-3 text-xs">
              <Sparkles className="w-5 h-5 text-flamenco flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-carbon">Tejido Ancestral</h4>
                <p className="text-carbon/60">Crochet fino de algodón</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs">
              <HeartHandshake className="w-5 h-5 text-cardon flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-carbon">Comercio Justo</h4>
                <p className="text-carbon/60">Apoyo directo a tejedores</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs">
              <Truck className="w-5 h-5 text-caribe flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-carbon">Envío Gratis</h4>
                <p className="text-carbon/60">Toda Colombia (2-5 días)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs">
              <Shield className="w-5 h-5 text-cardenal flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-carbon">Pieza Exclusiva</h4>
                <p className="text-carbon/60">Nunca habrá otra idéntica</p>
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
                  className="w-full flex items-center justify-center space-x-2 bg-[#25D366] text-white py-4 rounded-full font-bold hover:bg-[#20ba5a] active:scale-95 transition-all duration-300 shadow-lg uppercase text-xs tracking-wider"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Pedir directo por WhatsApp</span>
                </a>

                {/* Botón Carrito */}
                <button
                  onClick={() => addToCart(producto)}
                  className="w-full flex items-center justify-center space-x-2 border-2 border-carbon text-carbon hover:bg-carbon hover:text-arena py-4 rounded-full font-bold active:scale-95 transition-all duration-300 uppercase text-xs tracking-wider"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Añadir al Carrito de Compras</span>
                </button>
              </>
            ) : (
              <a
                href={getProductWhatsappLink({ ...producto, precio: 0 })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 border-2 border-carbon/25 text-carbon/60 py-4 rounded-full font-bold hover:border-cardenal hover:text-cardenal transition-all duration-300 text-xs uppercase tracking-wider"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Encargar pieza similar</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 4. PRODUCTOS RELACIONADOS */}
      {productosRelacionados.length > 0 && (
        <div className="space-y-8 pt-12 border-t border-arena-oscura/35">
          <div className="text-center md:text-left space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-cardenal block">Sugerencias exclusivas</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-carbon">Otras Mochilas con Alma</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosRelacionados.map((prod) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-arena-oscura/10 border border-arena-oscura/30 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[4/5] bg-arena-oscura/20 overflow-hidden">
                  <Link href={`/producto/${prod.id}`}>
                    <Image
                      src={prod.imagenes[0]}
                      alt={prod.nombre}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>
                </div>
                <div className="p-4 flex flex-col flex-grow text-left">
                  <h3 className="font-display font-bold text-sm text-carbon mb-2 truncate">
                    <Link href={`/producto/${prod.id}`}>{prod.nombre}</Link>
                  </h3>
                  <span className="text-sm font-semibold text-carbon font-mono mt-auto">
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
