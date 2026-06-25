"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Producto } from "@/data/productos";
import { simbolosData } from "@/data/simbolos";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Eye, Flame, Truck } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const { addToCart } = useCart();
  const symbolDetail = simbolosData[producto.simbolo];

  const discount = producto.precioAnterior
    ? Math.round((1 - producto.precio / producto.precioAnterior) * 100)
    : 0;
  const savings = producto.precioAnterior ? producto.precioAnterior - producto.precio : 0;

  // Espectadores "en vivo" deterministas (estables en SSR, sin mismatch de hidratación)
  const viewers = 5 + (producto.id.length * 7) % 22;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col card-pop overflow-hidden h-full"
    >
      {/* Imagen */}
      <div className="relative w-full aspect-[4/5] bg-cream-dark/20 overflow-hidden">

        {/* Badges izquierda */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {producto.disponible ? (
            <span className="inline-flex items-center gap-1 bg-flamenco text-white text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full shadow-md animate-pulse-ring">
              <Flame className="w-3 h-3" /> Última pieza
            </span>
          ) : (
            <span className="bg-chocolate/90 text-white text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
              Vendida
            </span>
          )}
          {discount > 0 && producto.disponible && (
            <span className="bg-gold-lux text-carbon text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full shadow-md">
              −{discount}%
            </span>
          )}
        </div>

        {/* Tótem (símbolo sagrado) */}
        {symbolDetail && (
          <div className="absolute top-3 right-3 z-20 group/tooltip">
            <div className="p-2 bg-white/95 backdrop-blur-md rounded-xl border border-cream-dark text-chocolate shadow-md cursor-help transition-all duration-300 hover:border-gold-lux">
              {React.createElement(symbolDetail.icon, { size: 18, className: symbolDetail.class })}
            </div>
            <div className="absolute top-11 right-0 w-48 p-3.5 rounded-2xl glass-panel text-left opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all duration-300 pointer-events-none z-30 shadow-2xl space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-gold-deep font-title block">Inspiración Wayuu</span>
              <h4 className="font-title font-bold text-sm text-chocolate flex items-baseline gap-1.5 leading-none">
                {symbolDetail.name}
                <span className="text-[9px] text-chocolate-light font-normal lowercase italic">&quot;{symbolDetail.wayuu}&quot;</span>
              </h4>
              <p className="text-[11px] text-chocolate-light leading-relaxed font-medium">{symbolDetail.meaning}</p>
            </div>
          </div>
        )}

        {/* Imagen */}
        <Link href={`/producto/${producto.id}`} className="block w-full h-full">
          <Image
            src={producto.imagenes[0]}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
            priority={producto.destacado}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Espectadores en vivo (FOMO) */}
        {producto.disponible && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-carbon/75 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            <Eye className="w-3 h-3 text-gold-soft" /> {viewers} viéndola ahora
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-grow p-5 flex flex-col">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-caribe-deep uppercase tracking-widest font-black">
              {producto.colores.slice(0, 2).join(" · ")}
            </span>
            <div className="flex gap-0.5 text-sol text-xs leading-none">★★★★★</div>
          </div>

          <h3 className="font-lux font-bold text-xl text-chocolate group-hover:text-caribe transition-colors leading-snug">
            <Link href={`/producto/${producto.id}`}>{producto.nombre}</Link>
          </h3>

          <p className="text-xs text-chocolate-light line-clamp-2 leading-relaxed font-light">
            {producto.descripcion}
          </p>
        </div>

        <div className="space-y-3 pt-4 mt-auto">
          {/* Precio + anclaje */}
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-chocolate">{formatPrice(producto.precio)}</span>
              {producto.precioAnterior && (
                <span className="text-sm text-chocolate-light/60 line-through">{formatPrice(producto.precioAnterior)}</span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[10px] font-black text-cactus uppercase tracking-wide bg-cactus/10 px-2 py-1 rounded-full">
                Ahorras {formatPrice(savings)}
              </span>
            )}
          </div>

          {/* CTA */}
          {producto.disponible ? (
            <button onClick={() => addToCart(producto)} className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider cursor-pointer">
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar al carrito</span>
            </button>
          ) : (
            <Link href={`/producto/${producto.id}`} className="btn-outline w-full py-3.5 text-xs uppercase tracking-wider opacity-70">
              Ver pieza vendida
            </Link>
          )}

          {producto.disponible && (
            <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-chocolate-light uppercase tracking-wide">
              <Truck className="w-3.5 h-3.5 text-caribe" /> Envío gratis · Lista para enviar hoy
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
