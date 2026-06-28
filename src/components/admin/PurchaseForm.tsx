"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createPurchaseAction, updatePurchaseAction } from "@/lib/db/purchase-actions";
import { formatPrice } from "@/lib/utils";
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";

export interface ProductOption {
  id: string;
  nombre: string;
  costo: number;
  precio: number;
}

export interface PurchaseInitial {
  id: string;
  proveedor: string;
  fecha: string;
  costoEnvio: string;
  notas: string;
  items: Array<{
    product_id: string;
    referencia: string;
    cantidad: string;
    costo_unitario: string;
    precio_venta: string;
  }>;
}

interface Row {
  key: number;
  product_id: string;   // "" = nueva referencia
  nombre: string;
  referencia: string;
  cantidad: string;
  costo_unitario: string;
  precio_venta: string;
}

let nextKey = 1;
function emptyRow(): Row {
  return { key: nextKey++, product_id: "", nombre: "", referencia: "", cantidad: "1", costo_unitario: "", precio_venta: "" };
}

function rowsFromInitial(initial: PurchaseInitial): Row[] {
  if (!initial.items.length) return [emptyRow()];
  return initial.items.map((it) => ({
    key: nextKey++,
    product_id: it.product_id,
    nombre: "",
    referencia: it.referencia,
    cantidad: it.cantidad,
    costo_unitario: it.costo_unitario,
    precio_venta: it.precio_venta,
  }));
}

const field = "w-full bg-cream border border-cream-dark rounded-xl px-3 py-2 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe";
const label = "text-xs font-black uppercase tracking-wide text-chocolate";

function SubmitBtn({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className="btn-primary px-7 py-3 text-sm uppercase tracking-wider disabled:opacity-60">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {pending ? "Guardando…" : label}
    </button>
  );
}

export default function PurchaseForm({ productos, initial }: { productos: ProductOption[]; initial?: PurchaseInitial }) {
  const editing = Boolean(initial);
  const [rows, setRows] = useState<Row[]>(initial ? rowsFromInitial(initial) : [emptyRow()]);
  const [proveedor, setProveedor] = useState(initial?.proveedor ?? "");
  const [fecha, setFecha] = useState(initial?.fecha ?? "");
  const [costoEnvio, setCostoEnvio] = useState(initial?.costoEnvio ?? "");
  const [notas, setNotas] = useState(initial?.notas ?? "");

  const update = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const onSelectProduct = (key: number, product_id: string) => {
    const prod = productos.find((p) => p.id === product_id);
    update(key, {
      product_id,
      nombre: prod ? prod.nombre : "",
      costo_unitario: prod && prod.costo ? String(prod.costo) : "",
      precio_venta: prod && prod.precio ? String(prod.precio) : "",
    });
  };

  const addRow = () => setRows((rs) => [...rs, emptyRow()]);
  const removeRow = (key: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));

  const num = (s: string) => parseInt(s || "0", 10) || 0;

  const totals = useMemo(() => {
    const unidades = rows.reduce((s, r) => s + num(r.cantidad), 0);
    const costo = rows.reduce((s, r) => s + num(r.cantidad) * num(r.costo_unitario), 0) + num(costoEnvio);
    const venta = rows.reduce((s, r) => s + num(r.cantidad) * num(r.precio_venta), 0);
    return { unidades, costo, venta };
  }, [rows, costoEnvio]);

  const gananciaPotencial = totals.venta - totals.costo;

  const payload = JSON.stringify({
    proveedor, fecha, costoEnvio: num(costoEnvio), notas,
    items: rows.map((r) => ({
      product_id: r.product_id || undefined,
      is_new: !r.product_id,
      nombre: r.nombre,
      referencia: r.referencia,
      cantidad: num(r.cantidad),
      costo_unitario: num(r.costo_unitario),
      precio_venta: num(r.precio_venta),
    })),
  });

  const valido = rows.some((r) => num(r.cantidad) > 0 && (r.product_id || r.nombre.trim()));

  return (
    <div className="space-y-6">
      <Link href="/admin/compras" className="inline-flex items-center gap-2 text-sm font-bold text-chocolate-light hover:text-caribe">
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos
      </Link>
      <h1 className="font-lux font-bold text-3xl text-chocolate">
        {editing ? `Editar pedido ${initial!.id}` : "Nuevo pedido de proveedor"}
      </h1>
      <p className="text-sm text-chocolate-light -mt-3">
        {editing
          ? "Al guardar se revierte el stock anterior de este pedido y se aplican las nuevas cantidades. En edición solo puedes ajustar referencias existentes (para nuevas, usa “Nuevo pedido”)."
          : "Carga varias mochilas de un mismo pedido. Cada línea suma stock; si eliges una referencia existente, las unidades se acumulan a ese producto."}
      </p>

      <form action={editing ? updatePurchaseAction : createPurchaseAction} className="space-y-6">
        {editing && <input type="hidden" name="id" value={initial!.id} />}
        <input type="hidden" name="payload" value={payload} />

        {/* Cabecera */}
        <div className="grid sm:grid-cols-4 gap-4 bg-white border border-cream-dark rounded-2xl p-6">
          <div className="space-y-1.5">
            <label className={label}>Proveedor</label>
            <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} className={field} placeholder="Tejedora / mayorista" />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={field} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Costo de envío</label>
            <input type="number" value={costoEnvio} onChange={(e) => setCostoEnvio(e.target.value)} className={field} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Notas</label>
            <input value={notas} onChange={(e) => setNotas(e.target.value)} className={field} placeholder="Opcional" />
          </div>
        </div>

        {/* Líneas */}
        <div className="bg-white border border-cream-dark rounded-2xl p-4 sm:p-6 space-y-3 overflow-x-auto">
          <div className="hidden lg:grid grid-cols-[2fr_1fr_0.7fr_1fr_1fr_auto] gap-3 px-1">
            {["Mochila / referencia", "Ref. proveedor", "Cant.", "Costo unit.", "Venta unit.", ""].map((h) => (
              <span key={h} className={label}>{h}</span>
            ))}
          </div>

          {rows.map((r) => (
            <div key={r.key} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_0.7fr_1fr_1fr_auto] gap-3 items-start border-b border-cream-dark/60 lg:border-0 pb-3 lg:pb-0">
              <div className="space-y-2">
                <select value={r.product_id} onChange={(e) => onSelectProduct(r.key, e.target.value)} className={field}>
                  {!editing && <option value="">➕ Nueva referencia…</option>}
                  {editing && <option value="">— Selecciona referencia —</option>}
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                {!r.product_id && (
                  <input value={r.nombre} onChange={(e) => update(r.key, { nombre: e.target.value })} className={field} placeholder="Nombre de la mochila *" />
                )}
              </div>
              <input value={r.referencia} onChange={(e) => update(r.key, { referencia: e.target.value })} className={field} placeholder="REF-001" />
              <input type="number" value={r.cantidad} onChange={(e) => update(r.key, { cantidad: e.target.value })} className={field} placeholder="1" />
              <input type="number" value={r.costo_unitario} onChange={(e) => update(r.key, { costo_unitario: e.target.value })} className={field} placeholder="90000" />
              <input type="number" value={r.precio_venta} onChange={(e) => update(r.key, { precio_venta: e.target.value })} className={field} placeholder="180000" />
              <button type="button" onClick={() => removeRow(r.key)} className="text-flamenco hover:text-flamenco-claro p-2 self-center" aria-label="Quitar línea">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button type="button" onClick={addRow} className="inline-flex items-center gap-2 text-sm font-bold text-caribe hover:text-caribe/80 pt-2">
            <Plus className="w-4 h-4" /> Agregar mochila
          </button>
        </div>

        {/* Totales + guardar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-cream-dark rounded-2xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-sm">
            <div><p className="text-xs text-chocolate-light font-bold uppercase">Unidades</p><p className="font-black text-chocolate">{totals.unidades}</p></div>
            <div><p className="text-xs text-chocolate-light font-bold uppercase">Costo total</p><p className="font-black text-chocolate">{formatPrice(totals.costo)}</p></div>
            <div><p className="text-xs text-chocolate-light font-bold uppercase">Venta total</p><p className="font-black text-chocolate">{formatPrice(totals.venta)}</p></div>
            <div><p className="text-xs text-chocolate-light font-bold uppercase">Ganancia potencial</p><p className="font-black text-cactus">{formatPrice(gananciaPotencial)}</p></div>
          </div>
          <SubmitBtn disabled={!valido} label={editing ? "Guardar cambios" : "Guardar pedido"} />
        </div>
      </form>
    </div>
  );
}
