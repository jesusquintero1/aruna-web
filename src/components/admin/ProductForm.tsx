"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { saveProduct } from "@/lib/db/admin-actions";
import { simbolosData } from "@/data/simbolos";
import type { ProductoAdmin } from "@/lib/db/products";
import type { Categoria } from "@/lib/db/categories";
import { Loader2, Save, ArrowLeft } from "lucide-react";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary px-7 py-3 text-sm uppercase tracking-wider disabled:opacity-60">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {pending ? "Guardando…" : "Guardar producto"}
    </button>
  );
}

const field = "w-full bg-cream border border-cream-dark rounded-xl px-4 py-2.5 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe";
const label = "text-xs font-black uppercase tracking-wide text-chocolate";

export default function ProductForm({ producto, categorias }: { producto?: ProductoAdmin; categorias: Categoria[] }) {
  const editing = Boolean(producto);
  const [previews, setPreviews] = useState<string[]>([]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/productos" className="inline-flex items-center gap-2 text-sm font-bold text-chocolate-light hover:text-caribe">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>
      <h1 className="font-lux font-bold text-3xl text-chocolate">{editing ? "Editar producto" : "Nuevo producto"}</h1>

      <form action={saveProduct} className="grid lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5 bg-white border border-cream-dark rounded-2xl p-6">
          {editing && <input type="hidden" name="id" value={producto!.id} />}

          <div className="space-y-1.5">
            <label className={label}>Nombre *</label>
            <input name="nombre" defaultValue={producto?.nombre} required className={field} placeholder="Mochila Arutka Cardenal" />
          </div>

          <div className="space-y-1.5">
            <label className={label}>Descripción</label>
            <textarea name="descripcion" defaultValue={producto?.descripcion} rows={5} className={field} placeholder="Historia y detalles de la pieza…" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={label}>Precio de costo (COP)</label>
              <input name="costo" type="number" defaultValue={producto?.costo} className={field} placeholder="90000" />
              <p className="text-[11px] text-chocolate-light">Lo que te costó la pieza.</p>
            </div>
            <div className="space-y-1.5">
              <label className={label}>Precio de venta (COP) *</label>
              <input name="precio" type="number" defaultValue={producto?.precio} required className={field} placeholder="180000" />
              <p className="text-[11px] text-chocolate-light">Lo que paga el cliente.</p>
            </div>
            <div className="space-y-1.5">
              <label className={label}>Stock *</label>
              <input name="stock" type="number" defaultValue={producto?.stock ?? 1} required className={field} placeholder="1" />
              <p className="text-[11px] text-chocolate-light">Unidades disponibles.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={label}>Precio anterior / tachado (opcional)</label>
            <input name="precioAnterior" type="number" defaultValue={producto?.precioAnterior} className={`${field} sm:max-w-[12rem]`} placeholder="220000" />
            <p className="text-[11px] text-chocolate-light">Solo si quieres mostrar un descuento: aparece tachado junto al precio de venta.</p>
          </div>

          <div className="space-y-1.5">
            <label className={label}>Colores (separados por coma)</label>
            <input name="colores" defaultValue={producto?.colores.join(", ")} className={field} placeholder="Cardenal Rojo, Arena Cálida, Negro" />
          </div>

          {/* Imágenes existentes */}
          {editing && producto!.imagenes.length > 0 && (
            <div className="space-y-2">
              <label className={label}>Imágenes actuales (desmarca para eliminar)</label>
              <div className="flex flex-wrap gap-3">
                {producto!.imagenes.map((url) => (
                  <label key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-cream-dark cursor-pointer block">
                    <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                    <input type="checkbox" name="keep_imagenes" value={url} defaultChecked className="absolute top-1 left-1 w-4 h-4 accent-caribe" />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={label}>{editing ? "Añadir imágenes" : "Imágenes"}</label>
            <input name="imagenes" type="file" accept="image/*" multiple onChange={onFiles} className={field + " file:mr-3 file:rounded-lg file:border-0 file:bg-caribe file:text-white file:px-3 file:py-1 file:font-bold file:text-xs"} />
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-cream-dark">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          <div className="bg-white border border-cream-dark rounded-2xl p-6 space-y-5">
            <div className="space-y-1.5">
              <label className={label}>Categoría</label>
              <select name="categoria_id" defaultValue={producto?.categoriaId ?? ""} className={field}>
                <option value="">— Sin categoría —</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={label}>Símbolo sagrado</label>
              <select name="simbolo" defaultValue={producto?.simbolo ?? "cardenal"} className={field}>
                {Object.entries(simbolosData).map(([key, s]) => (
                  <option key={key} value={key}>{s.name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" name="destacado" defaultChecked={producto?.destacado} className="w-5 h-5 accent-gold-lux" />
              <span className="text-sm font-bold text-chocolate">Destacar en la home</span>
            </label>
          </div>

          <SubmitBtn />
        </div>
      </form>
    </div>
  );
}
