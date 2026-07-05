"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { saveInfografia } from "@/lib/db/admin-actions";
import type { LineaProducto } from "@/data/productos";
import { Loader2, Upload, Trash2 } from "lucide-react";

function Botones({ tieneImagen }: { tieneImagen: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-2">
      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider disabled:opacity-60">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Guardar imagen
      </button>
      {tieneImagen && (
        <button type="submit" name="quitar" value="1" disabled={pending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-cream-dark text-xs font-black uppercase tracking-wider text-flamenco hover:bg-flamenco/10 disabled:opacity-60">
          <Trash2 className="w-4 h-4" /> Quitar
        </button>
      )}
    </div>
  );
}

/**
 * Sube/cambia la infografía que se muestra al pie del catálogo de una línea
 * (guía de tallas de mochilas, infografía de maquillaje, etc.).
 */
export default function InfografiaForm({ linea, titulo, descripcion, imagenActual }: {
  linea: LineaProducto;
  titulo: string;
  descripcion: string;
  imagenActual: string | null;
}) {
  const [state, formAction] = useActionState(saveInfografia, undefined);

  return (
    <form action={formAction} className="bg-white border border-cream-dark rounded-2xl p-6 space-y-4">
      <input type="hidden" name="linea" value={linea} />
      <div>
        <h2 className="font-title font-extrabold text-chocolate">{titulo}</h2>
        <p className="text-xs text-chocolate-light">{descripcion}</p>
      </div>

      {imagenActual && (
        <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden border border-cream-dark bg-cream">
          <Image src={imagenActual} alt={titulo} fill className="object-contain" sizes="448px" />
        </div>
      )}

      <input
        type="file"
        name="imagen"
        accept="image/*"
        className="w-full bg-cream border border-cream-dark rounded-xl px-4 py-2.5 text-sm text-chocolate font-semibold file:mr-3 file:rounded-lg file:border-0 file:bg-caribe file:text-white file:px-3 file:py-1 file:font-bold file:text-xs"
      />

      {state?.error && (
        <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm font-bold text-cactus bg-cactus/10 border border-cactus/30 rounded-xl px-4 py-3">Guardado. Ya se ve en la tienda.</p>
      )}

      <Botones tieneImagen={Boolean(imagenActual)} />
    </form>
  );
}
