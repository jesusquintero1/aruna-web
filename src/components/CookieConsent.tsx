"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/analytics/config";
import { Cookie } from "lucide-react";

/**
 * Aviso de cookies. Por privacidad, las cookies no esenciales (analítica) NO
 * se cargan hasta que el usuario acepta. La elección se guarda en localStorage;
 * AnalyticsScripts reacciona al evento para montar/no montar los scripts.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mostrar solo si aún no hay decisión guardada.
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (v: "granted" | "denied") => {
    setConsent(v);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:max-w-sm z-[60]">
      <div className="bg-carbon text-arena border border-white/10 rounded-2xl shadow-2xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-gold-lux flex-shrink-0 mt-0.5" />
          <p className="text-xs text-arena/80 leading-relaxed">
            Usamos cookies esenciales para que la tienda funcione y, con tu permiso, cookies de medición para mejorar.
            Lee nuestra{" "}
            <Link href="/cookies" className="underline hover:text-gold-lux font-semibold">política de cookies</Link>.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => choose("denied")}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full text-arena/70 hover:text-arena hover:bg-white/10 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={() => choose("granted")}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-gold-lux text-carbon hover:bg-gold-lux/90 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
