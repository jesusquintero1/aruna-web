"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MapPin, Mail, Heart, Truck, ShieldCheck, HeartHandshake } from "lucide-react";

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function Footer() {
  const trust = [
    { icon: Truck, text: siteConfig.shipping.national },
    { icon: HeartHandshake, text: "Comercio justo con artesanas Wayuu" },
    { icon: ShieldCheck, text: siteConfig.shipping.guarantee },
  ];

  return (
    <footer className="bg-carbon text-arena pt-0 mt-20 relative overflow-hidden">
      {/* Cenefa superior vibrante */}
      <div className="h-2 bg-kana-border opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          {/* Marca */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <span className="text-flamenco text-xl">✦</span>
              <span className="font-title font-black text-3xl tracking-widest text-arena">{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-arena/70 leading-relaxed font-medium">{siteConfig.tagline}</p>
            <a
              href={siteConfig.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-arena/70 hover:text-flamenco-claro bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-all text-sm font-bold"
            >
              <InstagramIcon className="w-4 h-4" /> @arunawayuu
            </a>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="font-title font-bold text-lg mb-5 text-arena">Explorar</h4>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Inicio", path: "/" },
                { name: "Catálogo de mochilas", path: "/catalogo" },
                { name: "Nuestra historia", path: "/historia" },
                { name: "El blog", path: "/blog" },
              ].map((l) => (
                <li key={l.path}>
                  <Link href={l.path} className="text-arena/70 hover:text-caribe transition-colors">{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-title font-bold text-lg mb-5 text-arena">Contacto</h4>
            <ul className="space-y-4 text-sm text-arena/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-flamenco-claro flex-shrink-0 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-caribe flex-shrink-0" />
                <span>{siteConfig.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Confianza */}
          <div className="space-y-4">
            <h4 className="font-title font-bold text-lg text-arena">Confianza Arüna</h4>
            <div className="space-y-3">
              {trust.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-arena/80 bg-white/5 p-2.5 rounded-xl">
                  <t.icon className="w-4 h-4 text-caribe flex-shrink-0" />
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-arena/50 block mb-2">Métodos de pago</span>
              <div className="flex flex-wrap gap-2 text-[10px] font-black text-carbon">
                {["Nequi", "Daviplata", "Bancolombia", "Tarjeta", "PayPal"].map((p) => (
                  <span key={p} className="bg-arena px-2 py-1 rounded">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-arena/50 gap-4">
          <p>© {new Date().getFullYear()} ARÜNA. Hecho con orgullo en Colombia.</p>
          <div className="flex items-center gap-1.5">
            <span>Tejido con</span>
            <Heart className="w-3.5 h-3.5 text-flamenco fill-current" />
            <span>por las maestras de La Guajira.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
