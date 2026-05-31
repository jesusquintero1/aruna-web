"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Producto } from "@/data/productos";
import { simbolosData } from "@/data/simbolos";
import { formatPrice, getProductWhatsappLink } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const { addToCart } = useCart();
  const whatsappLink = getProductWhatsappLink(producto);
  
  // Buscar información del símbolo sagrado
  const symbolDetail = simbolosData[producto.simbolo];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col bg-surface/40 border border-white/5 rounded-3xl overflow-hidden hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/[0.02] hover:bg-surface transition-all duration-500 h-full"
    >
      {/* Contenedor de la Imagen */}
      <div className="relative w-full aspect-[4/5] bg-obsidian/45 overflow-hidden">
        
        {/* BADGE DE DISPONIBILIDAD (Izquierda) */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {producto.disponible ? (
            <span className="bg-gold text-obsidian text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
              Pieza Única
            </span>
          ) : (
            <span className="bg-obsidian/85 text-sand-muted text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-md backdrop-blur-sm">
              Agotada
            </span>
          )}

          {producto.precioAnterior && producto.disponible && (
            <span className="bg-terracotta text-sand text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
              Oferta
            </span>
          )}
        </div>

        {/* INTERACTIVE TOTEM EMBLEN / TOOLTIP (Derecha) */}
        {symbolDetail && (
          <div className="absolute top-4 right-4 z-20 group/tooltip">
            <div className="p-2 bg-obsidian/85 backdrop-blur-md rounded-xl border border-white/10 text-sand shadow-lg cursor-help transition-all duration-300 hover:border-gold/50 hover:bg-obsidian">
              {React.createElement(symbolDetail.icon, { size: 18, className: symbolDetail.class })}
            </div>
            
            {/* Tooltip con Glassmorphism */}
            <div className="absolute top-10 right-0 w-48 p-3.5 rounded-2xl glass-panel text-left opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all duration-300 pointer-events-none z-30 shadow-2xl space-y-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-gold font-title block">
                Inspiración Wayuu
              </span>
              <h4 className="font-title font-bold text-xs text-sand flex items-baseline gap-1.5 leading-none">
                {symbolDetail.name}
                <span className="text-[8px] text-sand-muted font-normal lowercase italic">
                  &quot;{symbolDetail.wayuu}&quot;
                </span>
              </h4>
              <p className="text-[10px] text-sand-muted leading-relaxed font-sans font-medium">
                {symbolDetail.meaning}
              </p>
            </div>
          </div>
        )}

        {/* Imagen con Hover Effect */}
        <Link href={`/producto/${producto.id}`} className="block w-full h-full">
          <Image
            src={producto.imagenes[0]}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            priority={producto.destacado}
          />
          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-obsidian/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Quick Add To Cart Button (Móviles / Desktops en hover) */}
        {producto.disponible && (
          <button
            onClick={() => addToCart(producto)}
            className="absolute bottom-4 right-4 bg-sand text-obsidian p-3 rounded-full shadow-lg hover:bg-gold hover:text-obsidian transition-all duration-300 transform scale-90 sm:scale-0 sm:group-hover:scale-100 focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="Añadir al carrito"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contenido / Textos */}
      <div className="flex-grow p-6 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Colores */}
          <span className="text-[10px] text-sand-muted uppercase tracking-widest font-bold block">
            {producto.colores.slice(0, 2).join(" · ")}
          </span>

          {/* Nombre del Producto */}
          <h3 className="font-title font-bold text-lg text-sand group-hover:text-gold transition-colors leading-snug">
            <Link href={`/producto/${producto.id}`}>{producto.nombre}</Link>
          </h3>

          {/* Descripción corta */}
          <p className="text-xs text-sand-muted line-clamp-2 leading-relaxed">
            {producto.descripcion}
          </p>
        </div>

        <div className="space-y-4 pt-4 mt-auto">
          {/* Precios */}
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-sand font-mono">
              {formatPrice(producto.precio)}
            </span>
            {producto.precioAnterior && (
              <span className="text-xs text-sand-muted/50 line-through font-mono">
                {formatPrice(producto.precioAnterior)}
              </span>
            )}
          </div>

          {/* Botones de Conversión */}
          <div className="grid grid-cols-2 gap-2">
            {producto.disponible ? (
              <>
                {/* WhatsApp direct order */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1 bg-[#25D366] text-white py-2.5 px-3 rounded-full text-[10px] font-bold hover:bg-[#20ba5a] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Pedir</span>
                </a>

                {/* Ver Detalle */}
                <Link
                  href={`/producto/[id]`}
                  as={`/producto/${producto.id}`}
                  className="flex items-center justify-center space-x-1 border border-white/10 hover:border-gold hover:text-gold text-sand py-2.5 px-3 rounded-full text-[10px] font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300"
                >
                  <span>Detalles</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <a
                href={getProductWhatsappLink({ ...producto, precio: 0 })}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center space-x-1.5 border border-white/10 hover:border-gold hover:text-gold text-sand-muted py-2.5 px-3 rounded-full text-[10px] font-bold transition-all duration-300"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Preguntar disponibilidad</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
