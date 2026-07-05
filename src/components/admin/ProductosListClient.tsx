"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { ProductoAdmin } from "@/lib/db/products";
import type { LineaProducto } from "@/data/productos";
import { deleteProduct, togglePublicado } from "@/lib/db/admin-actions";
import { Pencil, Trash2, Star, Search, Eye, EyeOff } from "lucide-react";

/** Normaliza para buscar sin tildes ni mayúsculas. */
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

type FiltroLinea = "todas" | LineaProducto;

const tabs: { key: FiltroLinea; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "mochilas", label: "Mochilas" },
  { key: "maquillaje", label: "Maquillaje" },
];

export default function ProductosListClient({ productos, lineaInicial }: { productos: ProductoAdmin[]; lineaInicial?: LineaProducto }) {
  const [query, setQuery] = useState("");
  const [linea, setLinea] = useState<FiltroLinea>(lineaInicial ?? "todas");

  const filtrados = useMemo(() => {
    const q = norm(query.trim());
    return productos.filter((p) => {
      if (linea !== "todas" && p.linea !== linea) return false;
      if (!q) return true;
      return norm(`${p.nombre} ${p.categoria ?? ""}`).includes(q);
    });
  }, [productos, query, linea]);

  return (
    <div className="space-y-4">
      {/* Pestañas por línea */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setLinea(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${
              linea === t.key ? "bg-chocolate text-white" : "bg-white border border-cream-dark text-chocolate-light hover:text-chocolate"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-chocolate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o categoría…"
          className="w-full bg-white border border-cream-dark rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-chocolate focus:outline-none focus:border-caribe"
        />
      </div>

      <div className="bg-white border border-cream-dark rounded-2xl overflow-hidden">
        {filtrados.length === 0 ? (
          <p className="text-center text-chocolate-light py-12">
            {productos.length === 0 ? "No hay productos." : "Ningún producto coincide con la búsqueda."}
          </p>
        ) : (
          <div className="divide-y divide-cream-dark">
            {filtrados.map((p) => (
              <div key={p.id} className={`flex items-center gap-4 p-4 ${p.publicado ? "" : "bg-cream/50"}`}>
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-dark/30 flex-shrink-0">
                  <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-chocolate truncate flex items-center gap-1.5">
                    {p.nombre}
                    {p.destacado && <Star className="w-3.5 h-3.5 text-gold-lux fill-current" />}
                    {!p.publicado && (
                      <span className="text-[10px] font-black uppercase tracking-wide bg-sol/30 text-chocolate px-2 py-0.5 rounded-full">Borrador</span>
                    )}
                  </p>
                  <p className="text-xs text-chocolate-light">
                    {p.linea === "maquillaje" ? "Maquillaje" : "Mochilas"} · {p.categoria} · {formatPrice(p.precio)}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className={`text-xs font-black ${p.stock > 0 ? "text-cactus" : "text-flamenco"}`}>
                    {p.stock > 0 ? `${p.stock} en stock` : "Agotado"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Publicar / despublicar */}
                  <form action={togglePublicado}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="publicar" value={p.publicado ? "0" : "1"} />
                    <button
                      type="submit"
                      className={`p-2 rounded-lg hover:bg-cream ${p.publicado ? "text-cactus hover:text-chocolate" : "text-chocolate-light hover:text-cactus"}`}
                      aria-label={p.publicado ? "Despublicar" : "Publicar"}
                      title={p.publicado ? "Visible en la tienda — clic para despublicar" : "Borrador — clic para publicar"}
                    >
                      {p.publicado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </form>
                  <Link href={`/admin/productos/${p.id}`} className="p-2 text-chocolate-light hover:text-caribe rounded-lg hover:bg-cream" aria-label="Editar">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="p-2 text-chocolate-light hover:text-flamenco rounded-lg hover:bg-cream" aria-label="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {query.trim() && (
        <p className="text-xs text-chocolate-light text-center">
          {filtrados.length} de {productos.length} productos
        </p>
      )}
    </div>
  );
}
