"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { ProductoAdmin } from "@/lib/db/products";
import type { Order } from "@/lib/db/orders";
import { updateOrderAction } from "@/lib/db/pos-actions";
import { ArrowLeft, Plus, Minus, Trash2, Loader2, Save, AlertTriangle } from "lucide-react";

type Estado = "pendiente" | "pagado" | "enviado" | "cancelado";
const metodos = ["Efectivo", "Nequi", "Daviplata", "Bancolombia", "Tarjeta"];
const estados: Estado[] = ["pendiente", "pagado", "enviado", "cancelado"];
const departamentos = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas",
  "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
  "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
  "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
  "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada", "Bogotá D.C.",
];

interface Line {
  product_id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function OrderEditClient({ order, products }: { order: Order; products: ProductoAdmin[] }) {
  const router = useRouter();
  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  // Ítems con producto válido (los de producto eliminado no se pueden re-guardar)
  const itemsValidos = (order.order_items ?? []).filter((it) => it.product_id);
  const huboItemsHuérfanos = (order.order_items ?? []).length > itemsValidos.length;

  // Cantidad original por producto en ESTE pedido (se repone al editar → suma al stock disponible)
  const originalQty = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of itemsValidos) m[it.product_id!] = (m[it.product_id!] ?? 0) + it.cantidad;
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const [lines, setLines] = useState<Line[]>(
    itemsValidos.map((it) => ({
      product_id: it.product_id!,
      nombre: it.nombre_snapshot,
      cantidad: it.cantidad,
      precio: it.precio_snapshot,
    }))
  );
  const [estado, setEstado] = useState<Estado>(order.estado as Estado);
  const [metodo, setMetodo] = useState(order.metodo_pago || "Efectivo");
  const [descuento, setDescuento] = useState(order.descuento || 0);
  const [nombre, setNombre] = useState(order.cliente_nombre || "");
  const [telefono, setTelefono] = useState(order.cliente_telefono || "");
  const [email, setEmail] = useState(order.cliente_email || "");
  const [cedula, setCedula] = useState(order.cliente_cedula || "");
  const [direccion, setDireccion] = useState(order.cliente_direccion || "");
  const [ciudad, setCiudad] = useState(order.cliente_ciudad || "");
  const [departamento, setDepartamento] = useState(order.cliente_departamento || "");
  const [notas, setNotas] = useState(order.notas || "");
  const [addQuery, setAddQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Stock disponible para cada producto al editar este pedido
  const maxFor = (pid: string) => (byId[pid]?.stock ?? 0) + (originalQty[pid] ?? 0);

  const setQty = (pid: string, delta: number) =>
    setLines((ls) =>
      ls.map((l) => {
        if (l.product_id !== pid) return l;
        const next = l.cantidad + delta;
        return { ...l, cantidad: Math.max(1, Math.min(next, maxFor(pid))) };
      })
    );
  const setPrecio = (pid: string, v: number) =>
    setLines((ls) => ls.map((l) => (l.product_id === pid ? { ...l, precio: Math.max(0, Math.round(v) || 0) } : l)));
  const removeLine = (pid: string) => setLines((ls) => ls.filter((l) => l.product_id !== pid));
  const addProduct = (p: ProductoAdmin) => {
    setLines((ls) => (ls.some((l) => l.product_id === p.id) ? ls : [...ls, { product_id: p.id, nombre: p.nombre, cantidad: 1, precio: p.precio }]));
    setAddQuery("");
  };

  const candidatos = useMemo(() => {
    const q = norm(addQuery.trim());
    if (!q) return [];
    const yaEn = new Set(lines.map((l) => l.product_id));
    return products
      .filter((p) => !yaEn.has(p.id) && maxFor(p.id) > 0 && norm(p.nombre).includes(q))
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addQuery, lines, products]);

  const subtotal = lines.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const desc = Math.min(Math.max(0, descuento), subtotal);
  const total = subtotal - desc;
  const esEnvio = Boolean(direccion || ciudad || departamento);

  const submit = async () => {
    if (submitting) return;
    if (!lines.length) { setError("El pedido debe tener al menos un producto."); return; }
    setSubmitting(true); setError("");
    const res = await updateOrderAction({
      id: order.id,
      estado,
      metodoPago: metodo,
      descuento: desc,
      cliente: {
        nombre: nombre.trim() || null,
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        cedula: cedula.trim() || null,
        direccion: direccion.trim() || null,
        ciudad: ciudad.trim() || null,
        departamento: departamento.trim() || null,
      },
      notas: notas.trim() || null,
      items: lines.map((l) => ({ product_id: l.product_id, cantidad: l.cantidad, precio_unitario: l.precio })),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push(`/admin/pedidos/${order.id}`);
      router.refresh();
    } else {
      setError(res.error || "No se pudo guardar el pedido.");
    }
  };

  const inputCls = "w-full bg-white border border-cream-dark rounded-xl px-3 py-2 text-sm font-semibold text-chocolate focus:outline-none focus:border-caribe";

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={`/admin/pedidos/${order.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-chocolate-light hover:text-caribe">
        <ArrowLeft className="w-4 h-4" /> Volver al pedido
      </Link>

      <div>
        <h1 className="font-lux font-bold text-3xl text-chocolate">Editar {order.id}</h1>
        <p className="text-sm text-chocolate-light">{order.channel === "pos" ? "Venta POS" : "Pedido online"}</p>
      </div>

      {huboItemsHuérfanos && (
        <div className="flex items-start gap-3 bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          <AlertTriangle className="w-5 h-5 text-sol flex-shrink-0 mt-0.5" />
          <div>Este pedido tenía productos que ya fueron eliminados del catálogo. Esas líneas no se pueden editar y se quitarán al guardar.</div>
        </div>
      )}

      {/* Ítems */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-4">
        <h2 className="font-title font-extrabold text-chocolate">Productos</h2>
        {lines.length === 0 ? (
          <p className="text-sm text-chocolate-light py-3 text-center">Agrega al menos un producto.</p>
        ) : (
          <div className="divide-y divide-cream-dark">
            {lines.map((l) => {
              const editado = l.precio !== (byId[l.product_id]?.precio ?? l.precio);
              return (
                <div key={l.product_id} className="py-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex-grow truncate text-chocolate font-semibold">{l.nombre}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setQty(l.product_id, -1)} className="p-1 text-chocolate-light hover:text-flamenco"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="font-black text-chocolate w-6 text-center">{l.cantidad}</span>
                      <button onClick={() => setQty(l.product_id, 1)} disabled={l.cantidad >= maxFor(l.product_id)} className="p-1 text-chocolate-light hover:text-caribe disabled:opacity-30"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <span className="font-black text-chocolate w-24 text-right">{formatPrice(l.precio * l.cantidad)}</span>
                    <button onClick={() => removeLine(l.product_id)} className="p-1 text-chocolate-light hover:text-flamenco" aria-label="Quitar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-chocolate-light">Precio c/u</label>
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-chocolate-light">$</span>
                      <input type="number" min={0} step={1000} inputMode="numeric" value={l.precio}
                        onChange={(e) => setPrecio(l.product_id, Number(e.target.value))}
                        className={`w-full bg-cream border rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-chocolate focus:outline-none focus:border-caribe ${editado ? "border-sol" : "border-cream-dark"}`} />
                    </div>
                    <span className="text-[11px] text-chocolate-light">stock disp.: {maxFor(l.product_id)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Agregar producto */}
        <div className="relative">
          <div className="relative">
            <Plus className="w-4 h-4 text-chocolate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input value={addQuery} onChange={(e) => setAddQuery(e.target.value)} placeholder="Agregar producto…" className="w-full bg-cream border border-cream-dark rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-chocolate focus:outline-none focus:border-caribe" />
          </div>
          {candidatos.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-cream-dark rounded-xl shadow-lg overflow-hidden">
              {candidatos.map((p) => (
                <button key={p.id} onClick={() => addProduct(p)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-cream flex justify-between items-center">
                  <span className="text-chocolate font-semibold truncate">{p.nombre}</span>
                  <span className="text-xs text-chocolate-light whitespace-nowrap ml-2">{formatPrice(p.precio)} · {maxFor(p.id)} disp.</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cliente + pago */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-3">
          <h2 className="font-title font-extrabold text-chocolate">Cliente</h2>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Cédula" className={inputCls} />
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" className={inputCls} />
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ciudad" className={inputCls} />
            <select value={departamento} onChange={(e) => setDepartamento(e.target.value)} className={inputCls}>
              <option value="">Departamento</option>
              {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {esEnvio && <p className="text-[11px] text-chocolate-light">Pedido con datos de envío.</p>}
        </div>

        <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-3">
          <h2 className="font-title font-extrabold text-chocolate">Pago y estado</h2>
          <label className="text-xs font-bold uppercase tracking-wide text-chocolate-light">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as Estado)} className={inputCls}>
            {estados.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <label className="text-xs font-bold uppercase tracking-wide text-chocolate-light">Método de pago</label>
          <select value={metodo} onChange={(e) => setMetodo(e.target.value)} className={inputCls}>
            {metodos.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <label className="text-xs font-bold uppercase tracking-wide text-chocolate-light">Descuento</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-chocolate-light">$</span>
            <input type="number" min={0} step={1000} inputMode="numeric" value={descuento || ""} onChange={(e) => setDescuento(Math.max(0, Math.round(Number(e.target.value)) || 0))} placeholder="0" className={`${inputCls} pl-6`} />
          </div>

          <div className="space-y-1 border-t border-cream-dark pt-3">
            <div className="flex justify-between text-sm text-chocolate-light"><span>Subtotal</span><span className="font-semibold text-chocolate">{formatPrice(subtotal)}</span></div>
            {desc > 0 && <div className="flex justify-between text-sm text-cactus"><span>Descuento</span><span className="font-semibold">− {formatPrice(desc)}</span></div>}
            <div className="flex justify-between text-lg font-black text-chocolate"><span>Total</span><span className="text-flamenco">{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-2">
        <h2 className="font-title font-extrabold text-chocolate">Notas</h2>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} className={inputCls} placeholder="Notas internas del pedido…" />
      </div>

      {error && <p className="text-sm text-flamenco font-semibold text-center bg-flamenco-light rounded-xl py-2">{error}</p>}

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={submitting || !lines.length} className="btn-primary px-6 py-3 text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {submitting ? "Guardando…" : "Guardar cambios"}
        </button>
        <Link href={`/admin/pedidos/${order.id}`} className="btn-secondary px-5 py-3 text-xs uppercase tracking-wider">Cancelar</Link>
      </div>
    </div>
  );
}
