"use client";

import React, { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { saveProduct, createVideoUploadUrl } from "@/lib/db/admin-actions";
import { simbolosData } from "@/data/simbolos";
import type { ProductoAdmin } from "@/lib/db/products";
import type { Categoria } from "@/lib/db/categories";
import type { LineaProducto } from "@/data/productos";
import { Loader2, Save, ArrowLeft, Film, X } from "lucide-react";

function SubmitBtn({ procesando }: { procesando: boolean }) {
  const { pending } = useFormStatus();
  const busy = pending || procesando;
  return (
    <button type="submit" disabled={busy} className="btn-primary px-7 py-3 text-sm uppercase tracking-wider disabled:opacity-60">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {pending ? "Guardando…" : procesando ? "Procesando fotos…" : "Guardar producto"}
    </button>
  );
}

/**
 * Comprime una imagen en el navegador antes de subirla: la redimensiona a máx.
 * 2000px y la recodifica a JPEG. Así una foto de celular de 4–8 MB queda en
 * ~300–600 KB y nunca choca con el tope de request de Netlify (~6 MB), y
 * cualquier formato que el navegador sepa leer (PNG, WebP, AVIF, BMP…) se
 * normaliza a JPEG. Si el navegador no puede decodificarla, se envía tal cual.
 */
async function comprimirImagen(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const MAX = 2000;
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

const MAX_VIDEO_MB = 50;

/**
 * Sube un video directo del navegador a Supabase Storage con una URL firmada
 * que genera el servidor (los videos superan el tope de request de Netlify,
 * así que no pueden viajar dentro del form). Devuelve la URL pública.
 */
async function subirVideo(file: File): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    return { error: `"${file.name}" pesa más de ${MAX_VIDEO_MB} MB. Recórtalo o comprímelo antes de subirlo.` };
  }
  const res = await createVideoUploadUrl(file.name, file.type);
  if ("error" in res) return { error: res.error };
  const put = await fetch(res.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) return { error: `No se pudo subir "${file.name}" (HTTP ${put.status}).` };
  return { url: res.publicUrl };
}

const field = "w-full bg-cream border border-cream-dark rounded-xl px-4 py-2.5 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe";
const label = "text-xs font-black uppercase tracking-wide text-chocolate";

export default function ProductForm({ producto, categorias, lineaInicial }: { producto?: ProductoAdmin; categorias: Categoria[]; lineaInicial?: LineaProducto }) {
  const editing = Boolean(producto);
  const [previews, setPreviews] = useState<string[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [state, formAction] = useActionState(saveProduct, undefined);
  const [linea, setLinea] = useState<LineaProducto>(producto?.linea ?? lineaInicial ?? "mochilas");
  const [videosSubidos, setVideosSubidos] = useState<{ url: string; nombre: string }[]>([]);
  const [subiendoVideo, setSubiendoVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // El dropdown de categorías solo muestra las de la línea elegida.
  const categoriasLinea = categorias.filter((c) => c.linea === linea);

  const onVideos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;
    setVideoError(null);
    setSubiendoVideo(true);
    try {
      for (const f of files) {
        const r = await subirVideo(f);
        if ("error" in r) { setVideoError(r.error); continue; }
        setVideosSubidos((prev) => [...prev, { url: r.url, nombre: f.name }]);
      }
    } finally {
      setSubiendoVideo(false);
      input.value = ""; // el video ya está en Storage; el form solo envía su URL
    }
  };

  // Comprime las fotos al seleccionarlas y reemplaza los archivos del input,
  // para que el form envíe las versiones livianas.
  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files || []);
    if (files.length === 0) { setPreviews([]); return; }
    setProcesando(true);
    try {
      const comprimidas = await Promise.all(files.map(comprimirImagen));
      const dt = new DataTransfer();
      comprimidas.forEach((f) => dt.items.add(f));
      input.files = dt.files;
      setPreviews(comprimidas.map((f) => URL.createObjectURL(f)));
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/productos" className="inline-flex items-center gap-2 text-sm font-bold text-chocolate-light hover:text-caribe">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>
      <h1 className="font-lux font-bold text-3xl text-chocolate">{editing ? "Editar producto" : "Nuevo producto"}</h1>

      <form action={formAction} className="grid lg:grid-cols-3 gap-6">
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
            <p className="text-[11px] text-chocolate-light">Puedes subir fotos de cualquier tamaño: se comprimen automáticamente antes de enviarse.</p>
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

          {/* Videos existentes */}
          {editing && (producto!.videos?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <label className={label}>Videos actuales (desmarca para eliminar)</label>
              <div className="flex flex-wrap gap-3">
                {producto!.videos!.map((url) => (
                  <label key={url} className="relative w-32 rounded-xl overflow-hidden border border-cream-dark cursor-pointer block">
                    <video src={url} className="w-32 h-20 object-cover bg-carbon" muted playsInline preload="metadata" />
                    <input type="checkbox" name="keep_videos" value={url} defaultChecked className="absolute top-1 left-1 w-4 h-4 accent-caribe" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Videos nuevos: suben directo a Storage al seleccionarlos */}
          <div className="space-y-1.5">
            <label className={label}>Videos (opcional)</label>
            <input type="file" accept="video/mp4,video/webm,video/quicktime" multiple onChange={onVideos} disabled={subiendoVideo} className={field + " file:mr-3 file:rounded-lg file:border-0 file:bg-chocolate file:text-white file:px-3 file:py-1 file:font-bold file:text-xs"} />
            <p className="text-[11px] text-chocolate-light">MP4, WebM o MOV, máx. {MAX_VIDEO_MB} MB por video. Se suben al instante, antes de guardar.</p>
            {subiendoVideo && (
              <p className="text-xs font-bold text-caribe flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo video…</p>
            )}
            {videoError && (
              <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{videoError}</p>
            )}
            {videosSubidos.length > 0 && (
              <div className="space-y-1 pt-1">
                {videosSubidos.map((v) => (
                  <div key={v.url} className="flex items-center gap-2 text-xs font-bold text-chocolate bg-cream rounded-lg px-3 py-2">
                    <Film className="w-3.5 h-3.5 text-caribe flex-shrink-0" />
                    <span className="truncate flex-grow">{v.nombre}</span>
                    <button type="button" aria-label="Quitar video" onClick={() => setVideosSubidos((prev) => prev.filter((x) => x.url !== v.url))} className="text-chocolate-light hover:text-flamenco">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <input type="hidden" name="videos_urls" value={v.url} />
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
              <label className={label}>Línea</label>
              <select name="linea" value={linea} onChange={(e) => setLinea(e.target.value as LineaProducto)} className={field}>
                <option value="mochilas">Mochilas Wayuu</option>
                <option value="maquillaje">Maquillaje</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={label}>Categoría</label>
              <select name="categoria_id" defaultValue={producto?.categoriaId ?? ""} className={field}>
                <option value="">— Sin categoría —</option>
                {categoriasLinea.map((c) => (
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

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" name="publicado" defaultChecked={producto ? producto.publicado : false} className="w-5 h-5 accent-cactus mt-0.5" />
              <span className="text-sm font-bold text-chocolate">
                Publicado
                <span className="block text-[11px] font-semibold text-chocolate-light">Si está desmarcado queda como borrador: no aparece en la tienda.</span>
              </span>
            </label>
          </div>

          {state?.error && (
            <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          <SubmitBtn procesando={procesando} />
        </div>
      </form>
    </div>
  );
}
