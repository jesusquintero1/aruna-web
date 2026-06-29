"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import type { PublicPurchase } from "@/lib/db/orders";

/**
 * Notificaciones flotantes de compras REALES recientes (anonimizadas: solo
 * ciudad + producto, sin nombre). Prueba social honesta — nada inventado.
 * Si no hay compras que mostrar, no se renderiza.
 */
export default function SocialProofToast({ purchases }: { purchases: PublicPurchase[] }) {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || purchases.length === 0) return;
    let hideTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      setIdx((i) => (i + 1) % purchases.length);
      setShow(true);
      hideTimer = setTimeout(() => setShow(false), 6000);
    };

    const firstTimer = setTimeout(cycle, 5000);
    const interval = setInterval(cycle, 16000);
    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, [dismissed, purchases.length]);

  if (purchases.length === 0 || dismissed) return null;
  const p = purchases[idx];

  return (
    <div className="fixed bottom-5 left-4 z-50 max-w-[300px] pointer-events-none">
      <AnimatePresence>
        {show && p && (
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
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-cream-dark/20 flex items-center justify-center">
              {p.imagen ? (
                <Image src={p.imagen} alt={p.producto} fill className="object-cover" sizes="48px" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-caribe" />
              )}
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-[11px] font-bold text-chocolate">
                {p.ciudad ? `Alguien de ${p.ciudad}` : "Alguien"} compró
              </p>
              <p className="text-[11px] text-chocolate-light truncate"><b className="text-chocolate">{p.producto}</b></p>
              <p className="text-[10px] text-cactus font-bold uppercase tracking-wide">✦ Compra reciente</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
