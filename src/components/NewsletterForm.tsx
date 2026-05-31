"use client";

import React, { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simular registro exitoso en cliente
    setSubmitted(true);
    setEmail("");
  };

  if (submitted) {
    return (
      <div className="bg-cardon/15 border border-cardon/30 p-4.5 rounded-2xl text-center animate-fade-in">
        <p className="text-xs sm:text-sm font-bold text-cardon">
          ¡Te has suscrito con éxito! Pronto recibirás noticias y leyendas de La Guajira.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
      <input
        type="email"
        placeholder="Tu correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-grow px-4 py-3 bg-arena border border-arena-oscura/60 rounded-full text-xs text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-cardenal font-medium"
        required
      />
      <button
        type="submit"
        className="bg-cardenal text-arena px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-cardenal/90 transition-colors shadow shadow-cardenal/15 whitespace-nowrap"
      >
        Suscribirse
      </button>
    </form>
  );
}
