"use client";

import React, { useState } from "react";
import { updateCategory, deleteCategory } from "@/lib/db/admin-actions";
import type { Categoria } from "@/lib/db/categories";
import { Tags, Trash2, Pencil, X, Check } from "lucide-react";

const field = "bg-cream border border-cream-dark rounded-xl px-3 py-2 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe";

export default function CategoriaRow({ categoria }: { categoria: Categoria }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={updateCategory}
        onSubmit={() => setEditing(false)}
        className="flex items-center gap-2 p-4 bg-cream/50"
      >
        <input type="hidden" name="id" value={categoria.id} />
        <input name="nombre" defaultValue={categoria.nombre} required className={`${field} flex-grow`} placeholder="Nombre" />
        <select name="linea" defaultValue={categoria.linea} className={field} title="Línea de producto">
          <option value="mochilas">Mochilas</option>
          <option value="maquillaje">Maquillaje</option>
        </select>
        <input name="orden" type="number" defaultValue={categoria.orden} className={`${field} w-20`} title="Orden (menor aparece primero)" />
        <button type="submit" className="p-2 text-cactus hover:bg-cactus/10 rounded-lg" aria-label="Guardar"><Check className="w-4 h-4" /></button>
        <button type="button" onClick={() => setEditing(false)} className="p-2 text-chocolate-light hover:bg-cream rounded-lg" aria-label="Cancelar"><X className="w-4 h-4" /></button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between p-4">
      <span className="flex items-center gap-2.5 font-bold text-chocolate">
        <Tags className="w-4 h-4 text-caribe" /> {categoria.nombre}
        <span className="text-[10px] text-chocolate-light font-normal">
          · {categoria.linea === "maquillaje" ? "Maquillaje" : "Mochilas"} · orden {categoria.orden}
        </span>
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setEditing(true)} className="p-2 text-chocolate-light hover:text-caribe rounded-lg hover:bg-cream" aria-label="Editar">
          <Pencil className="w-4 h-4" />
        </button>
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={categoria.id} />
          <button type="submit" className="p-2 text-chocolate-light hover:text-flamenco rounded-lg hover:bg-cream" aria-label="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
