"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { subscribeNewsletterAction, type NewsletterState } from "@/lib/db/newsletter-actions";

const initialState: NewsletterState = { status: "idle" };

export default function NewsletterForm({ fuente = "blog" }: { fuente?: "blog" | "footer" }) {
  const [state, formAction, pending] = useActionState(subscribeNewsletterAction, initialState);

  if (state.status === "ok" || state.status === "already") {
    return (
      <div className="bg-cardon/15 border border-cardon/30 p-4.5 rounded-2xl text-center animate-fade-in">
        <p className="text-xs sm:text-sm font-bold text-cardon">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 pt-2">
      <input type="hidden" name="fuente" value={fuente} />
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          name="email"
          placeholder="Tu correo electrónico"
          className="flex-grow px-4 py-3 bg-arena border border-arena-oscura/60 rounded-full text-xs text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-cardenal font-medium"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-cardenal text-arena px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-cardenal/90 transition-colors shadow shadow-cardenal/15 whitespace-nowrap disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Suscribirse"}
        </button>
      </div>
      <label className="flex items-start gap-2 text-[11px] text-carbon/60 leading-snug cursor-pointer">
        <input type="checkbox" name="consent" className="mt-0.5 accent-cardenal" required />
        <span>
          Acepto la{" "}
          <Link href="/privacidad" className="underline hover:text-cardenal font-semibold">
            Política de Privacidad
          </Link>{" "}
          y el tratamiento de mis datos (Ley 1581 de 2012).
        </span>
      </label>
      {state.status === "error" && (
        <p className="text-[11px] font-bold text-flamenco">{state.message}</p>
      )}
    </form>
  );
}
