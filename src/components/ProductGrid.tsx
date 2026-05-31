"use client";

import React, { useState } from "react";
import { productos } from "@/data/productos";
import { simbolosData } from "@/data/simbolos";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ProductGridProps {
  onlyFeatured?: boolean;
}

export default function ProductGrid({ onlyFeatured = false }: ProductGridProps) {
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<"todas" | "disponibles">("todas");

  // Filtrar productos
  let filteredProducts = onlyFeatured
    ? productos.filter((p) => p.destacado)
    : productos;

  // Aplicar filtro de disponibilidad
  if (availabilityFilter === "disponibles") {
    filteredProducts = filteredProducts.filter((p) => p.disponible);
  }

  // Aplicar filtro interactivo de símbolos sagrados
  if (activeSymbol) {
    filteredProducts = filteredProducts.filter((p) => p.simbolo === activeSymbol);
  }

  const selectedSymbolDetail = activeSymbol ? simbolosData[activeSymbol] : null;

  return (
    <div className="space-y-12">
      {/* 1. SECCIÓN INTERACTIVA DE FILTRADO POR TÓTEMS (Solo para el catálogo completo) */}
      {!onlyFeatured && (
        <div className="space-y-8 text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-gold font-title block">
            Filtra por la Inspiración del Tejido
          </span>
          
          {/* Fila de Tótems Interactivos */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* Botón Ver Todos */}
            <button
              onClick={() => setActiveSymbol(null)}
              className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 w-24 h-24 active:scale-95 ${
                activeSymbol === null
                  ? "bg-gold border-gold text-obsidian shadow-lg shadow-gold/15"
                  : "bg-surface/50 border-white/5 text-sand-muted hover:border-gold/30 hover:text-sand"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Ver Todos</span>
            </button>

            {/* Iconos de cada Símbolo Sagrado */}
            {Object.entries(simbolosData).map(([key, symbol]) => {
              const Icon = symbol.icon;
              const isActive = activeSymbol === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveSymbol(key)}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 w-24 h-24 active:scale-95 ${
                    isActive
                      ? "bg-gold border-gold text-obsidian shadow-lg shadow-gold/15"
                      : "bg-surface/50 border-white/5 text-sand-muted hover:border-gold/30 hover:text-sand"
                  }`}
                  title={`Filtrar por ${symbol.name}`}
                >
                  <div className="mb-2">
                    <Icon size={32} className={isActive ? "text-obsidian" : symbol.class} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-full">
                    {symbol.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Banner Explicativo del Símbolo Sagrado Activo */}
          <AnimatePresence mode="wait">
            {selectedSymbolDetail && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto glass-panel p-6 rounded-3xl text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-kana opacity-5 z-0" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    {React.createElement(selectedSymbolDetail.icon, { size: 44, className: selectedSymbolDetail.class })}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-gold font-title block">
                      Tótem Activo: {selectedSymbolDetail.tag}
                    </span>
                    <h3 className="font-title font-bold text-lg text-sand leading-none flex items-baseline gap-2">
                      Inspiración {selectedSymbolDetail.name}
                      <span className="text-xs text-sand-muted font-semibold italic uppercase tracking-wider">
                        &quot;{selectedSymbolDetail.wayuu}&quot;
                      </span>
                    </h3>
                    <p className="text-xs text-sand-muted leading-relaxed font-sans font-medium pt-1">
                      {selectedSymbolDetail.meaning}
                    </p>
                  </div>
                  
                  {/* Botón para resetear */}
                  <button
                    onClick={() => setActiveSymbol(null)}
                    className="absolute top-4 right-4 text-xs font-bold text-gold hover:underline uppercase tracking-wider"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filtro secundario de Disponibilidad */}
          <div className="flex justify-center gap-2 pt-2">
            {(["todas", "disponibles"] as const).map((filterType) => {
              const label = filterType === "todas" ? "Ver Todo el Telar" : "Mostrar Solo Disponibles";
              const isFilterActive = availabilityFilter === filterType;
              
              return (
                <button
                  key={filterType}
                  onClick={() => setAvailabilityFilter(filterType)}
                  className={`text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded-full border transition-all ${
                    isFilterActive
                      ? "border-white/20 bg-white/5 text-sand"
                      : "border-transparent text-sand-muted hover:text-sand"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. GRID DE PRODUCTOS */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-surface/30 rounded-3xl border border-dashed border-white/10">
          <p className="text-sand-muted text-sm font-medium">
            No se encontraron mochilas tejidas bajo esta inspiración en este momento.
          </p>
          {!onlyFeatured && (
            <button
              onClick={() => { setActiveSymbol(null); setAvailabilityFilter("todas"); }}
              className="mt-4 text-xs font-bold text-gold hover:underline uppercase tracking-wider"
            >
              Resetear Filtros
            </button>
          )}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((producto) => (
              <motion.div
                key={producto.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard producto={producto} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
