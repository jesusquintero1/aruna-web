"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, BadgeCheck } from "lucide-react";
import { productos } from "@/data/productos";

const ciudades = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
  "Bucaramanga", "Pereira", "Santa Marta", "Manizales", "París, FR",
  "Madrid, ES", "Miami, US",
];
const nombres = [
  "Valentina", "Mariana", "Catalina", "Daniela", "Camila", "Isabella",
  "Sofía", "Laura", "Andrés", "Sébastien", "Lucía", "Manuela",
];

interface Toast {
  nombre: string;
  ciudad: string;
  producto: string;
  imagen: string;
  hace: string;
}

function build(): Toast {
  const p = productos[Math.floor(Math.random() * productos.length)];
  return {
    nombre: nombres[Math.floor(Math.random() * nombres.length)],
    ciudad: ciudades[Math.floor(Math.random() * ciudades.length)],
    producto: p.nombre,
    imagen: p.imagenes[0],
    hace: `hace ${Math.floor(Math.random() * 40) + 3} min`,
  };
}

/**
 * Notificaciones flotantes de "compras recientes". Psicología de venta:
 * prueba social + FOMO. Aparece tras un retraso inicial y rota suavemente.
 */
export default function SocialProofToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    let hideTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      setToast(build());
      hideTimer = setTimeout(() => setToast(null), 6000);
    };

    const firstTimer = setTimeout(cycle, 5000);
    const interval = setInterval(cycle, 16000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  return (
    <div className="fixed bottom-5 left-4 z-50 max-w-[300px] pointer-events-none">
      <AnimatePresence>
        {toast && !dismissed && (
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.92 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative flex items-center gap-3 bg-white border border-cream-dark rounded-2xl shadow-2xl p-3 pr-8"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 text-chocolate/30 hover:text-flamenco transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-cream-dark/20">
              <Image src={toast.imagen} alt={toast.producto} fill className="object-cover" sizes="48px" />
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-[11px] font-bold text-chocolate flex items-center gap-1">
                {toast.nombre} de {toast.ciudad}
                <BadgeCheck className="w-3.5 h-3.5 text-caribe flex-shrink-0" />
              </p>
              <p className="text-[11px] text-chocolate-light truncate">compró <b className="text-chocolate">{toast.producto}</b></p>
              <p className="text-[10px] text-cactus font-bold uppercase tracking-wide">✦ Compra verificada · {toast.hace}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
