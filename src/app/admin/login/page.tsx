"use client";

import React, { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { Lock, User, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-lux px-4 relative overflow-hidden">
      <div className="ambient-glow bg-gold-glow top-[-20vw] right-[-10vw] opacity-25" />
      <div className="ambient-glow bg-ocean-glow bottom-[-20vw] left-[-10vw] opacity-20" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <span className="text-gold-lux text-lg">✦</span>
            <span className="font-lux font-bold text-3xl tracking-[0.25em] text-white uppercase">ARÜNA</span>
            <span className="text-gold-lux text-lg">✦</span>
          </div>
          <p className="text-[10px] text-white/50 font-bold tracking-[0.4em] uppercase mt-2">Panel de administración</p>
        </div>

        <form action={formAction} className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide text-chocolate">Usuario</label>
            <div className="relative">
              <User className="w-4 h-4 text-chocolate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="username"
                autoComplete="username"
                className="w-full bg-cream border border-cream-dark rounded-xl pl-10 pr-4 py-3 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe"
                placeholder="admin"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide text-chocolate">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-chocolate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full bg-cream border border-cream-dark rounded-xl pl-10 pr-4 py-3 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe"
                placeholder="••••••••"
              />
            </div>
          </div>

          {state.error && (
            <p className="text-sm text-flamenco font-semibold text-center bg-flamenco-light rounded-xl py-2">{state.error}</p>
          )}

          <button type="submit" disabled={pending} className="btn-gold w-full py-3.5 text-sm uppercase tracking-wider disabled:opacity-60">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {pending ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">Acceso restringido · Arüna Wayuu</p>
      </div>
    </div>
  );
}
