"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { createMovementAction, updateMovementAction, deleteMovementAction } from "@/lib/db/finance-actions";
import { formatPrice } from "@/lib/utils";
import type { FinanceMovement } from "@/lib/db/finance";
import { Plus, TrendingUp, TrendingDown, Wallet, History, Trash2, Pencil, X, Loader2 } from "lucide-react";

const field = "w-full bg-cream border border-cream-dark rounded-xl px-3 py-2 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe";
const label = "text-xs font-black uppercase tracking-wide text-chocolate";

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider disabled:opacity-60">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {children}
    </button>
  );
}

const META: Record<FinanceMovement["tipo"], { label: string; icon: typeof TrendingUp; color: string; signo: string }> = {
  inversion: { label: "Inversión", icon: Wallet, color: "text-caribe", signo: "+" },
  ingreso: { label: "Ingreso", icon: TrendingUp, color: "text-cactus", signo: "+" },
  gasto: { label: "Gasto", icon: TrendingDown, color: "text-flamenco", signo: "−" },
};

/** Normaliza una fecha (timestamp o date) al formato YYYY-MM-DD para <input type="date">. */
function toDateInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

/** Formulario inline para editar un movimiento ya guardado. */
function EditMovementRow({ m, onClose }: { m: FinanceMovement; onClose: () => void }) {
  return (
    <form action={updateMovementAction} className="space-y-3 bg-cream/60 px-4 py-3">
      <input type="hidden" name="id" value={m.id} />
      <div className="grid sm:grid-cols-[1fr_1.4fr_1fr_1fr] gap-3">
        <div className="space-y-1.5">
          <label className={label}>Tipo</label>
          <select name="tipo" defaultValue={m.tipo} className={field}>
            <option value="inversion">Inversión</option>
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={label}>Asunto</label>
          <input name="asunto" defaultValue={m.asunto} required className={field} />
        </div>
        <div className="space-y-1.5">
          <label className={label}>Monto (COP)</label>
          <input name="monto" type="number" defaultValue={m.monto} required className={field} />
        </div>
        <div className="space-y-1.5">
          <label className={label}>Fecha</label>
          <input name="fecha" type="date" defaultValue={toDateInput(m.fecha)} className={field} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={label}>Descripción (opcional)</label>
        <input name="descripcion" defaultValue={m.descripcion ?? ""} className={field} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-xs uppercase tracking-wider">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <SubmitBtn>Guardar cambios</SubmitBtn>
      </div>
    </form>
  );
}

export default function FinancePanel({ movimientos }: { movimientos: FinanceMovement[] }) {
  const [form, setForm] = useState<null | "inversion" | "movimiento">(null);
  const [verHistorial, setVerHistorial] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-title font-extrabold text-chocolate flex items-center gap-2">
          <Wallet className="w-5 h-5 text-caribe" /> Caja y movimientos
        </h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setForm(form === "inversion" ? null : "inversion")} className="btn-secondary px-4 py-2 text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4" /> Inversión
          </button>
          <button onClick={() => setForm(form === "movimiento" ? null : "movimiento")} className="btn-secondary px-4 py-2 text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4" /> Gasto / Ingreso
          </button>
          <button onClick={() => setVerHistorial((v) => !v)} className="btn-secondary px-4 py-2 text-xs uppercase tracking-wider">
            <History className="w-4 h-4" /> Historial
          </button>
        </div>
      </div>

      {/* Formulario inversión */}
      {form === "inversion" && (
        <form action={createMovementAction} className="grid sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-end bg-cream/60 border border-cream-dark rounded-xl p-4">
          <input type="hidden" name="tipo" value="inversion" />
          <div className="space-y-1.5">
            <label className={label}>Asunto</label>
            <input name="asunto" required className={field} placeholder="Aporte de capital" />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Monto (COP)</label>
            <input name="monto" type="number" required className={field} placeholder="1000000" />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Fecha (opcional)</label>
            <input name="fecha" type="date" className={field} />
          </div>
          <SubmitBtn>Agregar</SubmitBtn>
          <div className="sm:col-span-4 space-y-1.5">
            <label className={label}>Descripción (opcional)</label>
            <input name="descripcion" className={field} placeholder="Inversión inicial del negocio" />
          </div>
        </form>
      )}

      {/* Formulario gasto/ingreso */}
      {form === "movimiento" && (
        <form action={createMovementAction} className="space-y-3 bg-cream/60 border border-cream-dark rounded-xl p-4">
          <div className="grid sm:grid-cols-[1fr_1.5fr_1fr_1fr] gap-3">
            <div className="space-y-1.5">
              <label className={label}>Tipo</label>
              <select name="tipo" defaultValue="gasto" className={field}>
                <option value="gasto">Gasto (resta de la caja)</option>
                <option value="ingreso">Ingreso (suma a la caja)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={label}>Asunto</label>
              <input name="asunto" required className={field} placeholder="Gastos de envío" />
            </div>
            <div className="space-y-1.5">
              <label className={label}>Monto (COP)</label>
              <input name="monto" type="number" required className={field} placeholder="50000" />
            </div>
            <div className="space-y-1.5">
              <label className={label}>Fecha (opcional)</label>
              <input name="fecha" type="date" className={field} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={label}>Descripción (opcional)</label>
            <input name="descripcion" className={field} placeholder="Se enviaron las mochilas por bus, pagado a Nequi 300..." />
          </div>
          <div className="flex justify-end"><SubmitBtn>Registrar</SubmitBtn></div>
        </form>
      )}

      {/* Historial */}
      {verHistorial && (
        <div className="border border-cream-dark rounded-xl divide-y divide-cream-dark/60 overflow-hidden">
          {movimientos.length === 0 ? (
            <p className="text-sm text-chocolate-light py-6 text-center">Sin movimientos registrados.</p>
          ) : (
            movimientos.map((m) => {
              const meta = META[m.tipo];
              if (editId === m.id) {
                return <EditMovementRow key={m.id} m={m} onClose={() => setEditId(null)} />;
              }
              return (
                <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <meta.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${meta.color}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-chocolate truncate">{m.asunto}</p>
                      <p className="text-xs text-chocolate-light truncate">{meta.label} · {m.fecha}{m.descripcion ? ` · ${m.descripcion}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-sm font-black ${meta.color}`}>{meta.signo}{formatPrice(m.monto)}</span>
                    <button type="button" onClick={() => setEditId(m.id)} className="text-chocolate-light hover:text-caribe p-1" aria-label="Editar movimiento"><Pencil className="w-3.5 h-3.5" /></button>
                    <form action={deleteMovementAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="text-chocolate-light hover:text-flamenco p-1" aria-label="Eliminar movimiento"><Trash2 className="w-3.5 h-3.5" /></button>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
