"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import { MapPin, Mail, Phone, Heart } from "lucide-react";

// Icono de Instagram personalizado para máxima robustez en compresión ESM
const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { CactusIcon, DelfinIcon, ColibriIcon } from "./FaunaFloraIcons";

export default function Footer() {
  return (
    <footer className="bg-carbon text-arena pt-16 pb-8 border-t border-cardon/30 relative overflow-hidden">
      {/* Detalle decorativo Kana de borde superior */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-kana-border opacity-70"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Columna 1: Marca & Eslogan */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-display font-black text-3xl tracking-widest text-arena hover:text-flamenco-claro transition-colors">
                {siteConfig.name}
              </span>
              <span className="w-1.5 h-1.5 bg-cardenal rounded-full inline-block ml-1"></span>
            </Link>
            <p className="text-sm text-arena/70 leading-relaxed font-sans font-medium">
              {siteConfig.tagline}
            </p>
            <div className="flex items-center space-x-4">
              <a
                href={siteConfig.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-arena/60 hover:text-flamenco-claro p-2 bg-arena/5 rounded-full hover:bg-arena/10 transition-all"
                aria-label="Instagram de Aruna"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              {/* Fauna Decorativa en Footer */}
              <ColibriIcon size={24} className="text-flamenco opacity-40 animate-colibri" />
              <DelfinIcon size={24} className="text-caribe opacity-40" />
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 border-b border-arena-oscura/20 pb-2">
              Explorar
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-arena/70 hover:text-flamenco-claro hover:underline transition-all">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-arena/70 hover:text-flamenco-claro hover:underline transition-all">
                  Mochilas Wayuu (Catálogo)
                </Link>
              </li>
              <li>
                <Link href="/historia" className="text-arena/70 hover:text-flamenco-claro hover:underline transition-all">
                  Nuestra Historia
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-arena/70 hover:text-flamenco-claro hover:underline transition-all">
                  El Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información de Contacto */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 border-b border-arena-oscura/20 pb-2">
              Contacto
            </h4>
            <ul className="space-y-4 text-sm text-arena/70">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-flamenco-claro flex-shrink-0 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-flamenco-claro flex-shrink-0" />
                <span>{siteConfig.contact.whatsapp}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-flamenco-claro flex-shrink-0" />
                <span>{siteConfig.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Garantías y Confianza */}
          <div className="space-y-6">
            <h4 className="font-display font-bold text-lg border-b border-arena-oscura/20 pb-2">
              Confianza Aruna
            </h4>
            <div className="space-y-3.5 text-xs text-arena/75">
              <div className="flex items-center space-x-2 bg-arena/5 p-2 rounded-lg border border-arena-oscura/10">
                <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                <span>{siteConfig.shipping.national}</span>
              </div>
              <div className="flex items-center space-x-2 bg-arena/5 p-2 rounded-lg border border-arena-oscura/10">
                <span className="w-2 h-2 rounded-full bg-caribe"></span>
                <span>{siteConfig.shipping.international}</span>
              </div>
              <div className="flex items-center space-x-2 bg-arena/5 p-2 rounded-lg border border-arena-oscura/10">
                <span className="w-2 h-2 rounded-full bg-flamenco"></span>
                <span>{siteConfig.shipping.guarantee}</span>
              </div>
            </div>
            
            {/* Medios de Pago */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-arena/50 block mb-2">
                Métodos de Pago
              </span>
              <div className="flex flex-wrap gap-2 text-[10px] font-black text-carbon">
                <span className="bg-arena px-2 py-0.5 rounded">Nequi</span>
                <span className="bg-arena px-2 py-0.5 rounded">Daviplata</span>
                <span className="bg-arena px-2 py-0.5 rounded">Bancolombia</span>
                <span className="bg-arena px-2 py-0.5 rounded">PayPal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Borde sutil divisor */}
        <div className="border-t border-arena-oscura/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-arena/50 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} ARUNA. Todos los derechos reservados. Hecho con orgullo en Colombia.</p>
          
          <div className="flex items-center space-x-1">
            <span>Tejido con</span>
            <Heart className="w-3.5 h-3.5 text-cardenal fill-current" />
            <span>para el mundo ancestral.</span>
            <CactusIcon size={18} className="text-cardon/60 ml-2" />
          </div>
        </div>
      </div>
    </footer>
  );
}
