"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { ProductoAdmin } from "@/lib/db/products";
import { createPosSale } from "@/lib/db/pos-actions";
import { Plus, Minus, Search, Trash2, CheckCircle2, Receipt, Loader2 } from "lucide-react";

const metodos = ["Efectivo", "Nequi", "Daviplata", "Bancolombia", "Tarjeta"];

export default function POSClient({ products }: { products: ProductoAdmin[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [metodo, setMetodo] = useState("Efectivo");
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState("");

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  const filtered = products.filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase()));

  const add = (p: ProductoAdmin) => {
    setCart((c) => {
      const cur = c[p.id] || 0;
      if (cur >= p.stock) return c; // no exceder stock
      return { ...c, [p.id]: cur + 1 };
    });
  };
  const dec = (id: string) => setCart((c) => {
    const cur = (c[id] || 0) - 1;
    const next = { ...c };
    if (cur <= 0) delete next[id]; else next[id] = cur;
    return next;
  });

  const lines = Object.entries(cart).map(([id, qty]) => ({ p: byId[id], qty }));
  const total = lines.reduce((s, l) => s + l.p.precio * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  const submit = async () => {
    if (!count || submitting) return;
    setSubmitting(true); setError("");
    const res = await createPosSale({
      items: lines.map((l) => ({ product_id: l.p.id, cantidad: l.qty })),
      metodoPago: metodo,
      cliente: { nombre: cliente || undefined, telefono: telefono || undefined },
    });
    setSubmitting(false);
    if (res.ok && res.id) {
      setDoneId(res.id);
      setCart({}); setCliente(""); setTelefono("");
    } else {
      setError(res.error || "No se pudo registrar la venta.");
    }
  };

  if (doneId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <CheckCircle2 className="w-20 h-20 text-cactus mx-auto" />
        <h1 className="font-lux font-bold text-3xl text-chocolate">Venta registrada</h1>
        <p className="text-chocolate-light">Pedido <b className="text-chocolate">{doneId}</b> · pagado con éxito.</p>
        <button onClick={() => setDoneId("")} className="btn-primary px-7 py-3 text-sm uppercase tracking-wider mx-auto">
          <Receipt className="w-4 h-4" /> Nueva venta
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-lux font-bold text-3xl text-chocolate mb-6">POS · Punto de venta</h1>
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Catálogo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-chocolate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto…" className="w-full bg-white border border-cream-dark rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-chocolate focus:outline-none focus:border-caribe" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((p) => {
              const inCart = cart[p.id] || 0;
              const full = inCart >= p.stock;
              return (
                <button
                  key={p.id}
                  onClick={() => add(p)}
                  disabled={full}
                  className="text-left bg-white border border-cream-dark rounded-2xl overflow-hidden hover:border-caribe transition-colors disabled:opacity-50"
                >
                  <div className="relative aspect-square bg-cream-dark/20">
                    <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="150px" />
                    {inCart > 0 && <span className="absolute top-2 right-2 bg-caribe text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">{inCart}</span>}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-chocolate truncate">{p.nombre}</p>
                    <p className="text-sm font-black text-chocolate">{formatPrice(p.precio)}</p>
                    <p className="text-[10px] text-chocolate-light font-bold uppercase">{p.stock} en stock</p>
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="text-center text-chocolate-light py-10">Sin productos disponibles.</p>}
        </div>

        {/* Carrito de venta */}
        <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-4 lg:sticky lg:top-6">
          <h2 className="font-title font-extrabold text-chocolate">Venta actual ({count})</h2>

          {lines.length === 0 ? (
            <p className="text-sm text-chocolate-light py-6 text-center">Toca productos para agregarlos.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {lines.map((l) => (
                <div key={l.p.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-grow truncate text-chocolate font-semibold">{l.p.nombre}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => dec(l.p.id)} className="p-1 text-chocolate-light hover:text-flamenco"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="font-black text-chocolate w-5 text-center">{l.qty}</span>
                    <button onClick={() => add(l.p)} disabled={l.qty >= l.p.stock} className="p-1 text-chocolate-light hover:text-caribe disabled:opacity-30"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <span className="font-black text-chocolate w-20 text-right">{formatPrice(l.p.precio * l.qty)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between text-lg font-black text-chocolate border-t border-cream-dark pt-3">
            <span>Total</span><span className="text-flamenco">{formatPrice(total)}</span>
          </div>

          <div className="space-y-2">
            <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Cliente (opcional)" className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2 text-sm font-semibold text-chocolate focus:outline-none focus:border-caribe" />
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono (opcional)" className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2 text-sm font-semibold text-chocolate focus:outline-none focus:border-caribe" />
            <select value={metodo} onChange={(e) => setMetodo(e.target.value)} className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2 text-sm font-semibold text-chocolate focus:outline-none focus:border-caribe">
              {metodos.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-flamenco font-semibold text-center bg-flamenco-light rounded-xl py-2">{error}</p>}

          <button onClick={submit} disabled={!count || submitting} className="btn-primary w-full py-3.5 text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
            {submitting ? "Registrando…" : "Cobrar venta"}
          </button>
        </div>
      </div>
    </div>
  );
}
