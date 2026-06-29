import React from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

/**
 * Contenedor común para las páginas legales. Estilo de documento legible
 * sobre fondo claro, con aviso de plantilla (los textos deben revisarse con
 * un abogado y completar los datos del negocio antes de producción).
 */
export default function LegalShell({
  title,
  subtitle,
  actualizado,
  children,
}: {
  title: string;
  subtitle?: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-carbon/60 hover:text-flamenco transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <div className="bg-arena/40 border border-arena-oscura/30 rounded-3xl p-6 sm:p-10">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-carbon">{title}</h1>
        {subtitle && <p className="text-sm text-carbon/70 mt-2">{subtitle}</p>}
        <p className="text-xs text-carbon/40 mt-2">Última actualización: {actualizado}</p>

        <div className="flex items-start gap-3 bg-sol/15 border border-sol/40 rounded-2xl p-4 mt-6 text-xs text-carbon/80">
          <AlertTriangle className="w-4 h-4 text-sol flex-shrink-0 mt-0.5" />
          <span>
            <b>Plantilla.</b> Este documento es una base general que debe ser revisada por un abogado y completada
            con los datos reales del negocio (razón social, NIT, domicilio) antes de usarse en producción.
          </span>
        </div>

        <div className="legal-prose mt-8 space-y-5 text-sm text-carbon/80 leading-relaxed [&_h2]:font-title [&_h2]:font-extrabold [&_h2]:text-carbon [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-flamenco [&_a]:underline [&_strong]:text-carbon">
          {children}
        </div>
      </div>
    </div>
  );
}
