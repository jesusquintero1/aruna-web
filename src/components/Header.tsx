"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo", path: "/catalogo" },
    { name: "Historia", path: "/historia" },
    { name: "Blog", path: "/blog" },
  ];

  const announcements = [
    "✦ ENVÍO GRATIS A TODA COLOMBIA",
    "✦ ALTA ARTESANÍA WAYUU · PIEZAS ÚNICAS",
    "✦ TEJIDAS A MANO EN LA GUAJIRA",
    "✦ COMERCIO JUSTO CON LAS MAESTRAS TEJEDORAS",
    "✦ CERTIFICADO DE AUTENTICIDAD INCLUIDO",
  ];

  return (
    <>
      {/* Barra de anuncios con marquee de lujo */}
      <div className="fixed top-0 left-0 right-0 h-9 bg-carbon text-gold-soft text-[11px] font-bold uppercase tracking-[0.2em] flex items-center overflow-hidden z-50 shadow-sm">
        <div className="animate-marquee">
          {[...announcements, ...announcements].map((text, i) => (
            <span key={i} className="mx-8 flex items-center">{text}</span>
          ))}
        </div>
      </div>

      {/* Header principal */}
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-md py-3 border-b border-cream-dark"
            : "bg-white/40 backdrop-blur-sm py-5"
        }`}
        style={{ top: "36px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center w-full">

            {/* Izquierda: nav desktop / hamburguesa móvil */}
            <div className="flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-chocolate hover:text-flamenco p-2 rounded-full hover:bg-flamenco-light transition-all focus:outline-none"
                aria-label="Abrir menú"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <nav className="hidden md:flex items-center space-x-7">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`text-xs font-bold uppercase tracking-[0.15em] relative py-1 transition-colors ${
                        isActive ? "text-gold-deep" : "text-chocolate hover:text-caribe"
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <motion.span
                          layoutId="activeNavIndicator"
                          className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gold-lux rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Centro: logo */}
            <div className="flex justify-center items-center">
              <Link href="/" className="group flex flex-col items-center select-none text-center">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-gold-lux text-base leading-none">✦</span>
                  <span className="font-lux font-bold text-2xl sm:text-3xl tracking-[0.25em] text-chocolate group-hover:text-gold-deep transition-colors uppercase">
                    {siteConfig.name}
                  </span>
                  <span className="text-gold-lux text-base leading-none">✦</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-chocolate-light font-bold tracking-[0.4em] uppercase leading-none pt-1">
                  maison artesanal
                </span>
              </Link>
            </div>

            {/* Derecha: carrito */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-chocolate text-white pl-4 pr-5 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wide hover:bg-caribe transition-all focus:outline-none focus:ring-2 focus:ring-caribe shadow-sm"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Carrito</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-flamenco text-white font-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[100px] z-30 md:hidden bg-white border-b border-cream-dark shadow-2xl px-6 py-6 flex flex-col"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-base uppercase font-extrabold tracking-wide py-3 border-b border-cream-dark/60 transition-colors ${
                    isActive ? "text-flamenco pl-2 border-l-4 border-l-flamenco" : "text-chocolate hover:text-caribe"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
