"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X, Heart, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();

  // Cambiar fondo del header al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo", path: "/catalogo" },
    { name: "Nuestra Historia", path: "/historia" },
    { name: "El Blog", path: "/blog" },
  ];

  return (
    <>
      {/* Barra de Anuncios tipo Misolé */}
      <div className="fixed top-0 left-0 right-0 h-9 bg-gold text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex items-center justify-center z-50 shadow-sm">
        <span className="flex items-center gap-1.5 sm:gap-2">
          <span>✨</span>
          <span>ENVÍOS A TODO EL PAÍS</span>
          <span>•</span>
          <span>mochilas wayuu 100% originales</span>
          <span>✨</span>
        </span>
      </div>

      {/* Header Centrado Principal (Estilo Misolé) */}
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-obsidian/90 backdrop-blur-md shadow-sm py-3 border-b border-cream-dark/30"
            : "bg-transparent py-5"
        }`}
        style={{ top: "36px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center w-full">
            
            {/* LADO IZQUIERDO: Enlaces de Navegación (Desktop) y Hamburguesa (Móvil) */}
            <div className="flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-sand-muted hover:text-gold p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none"
                aria-label="Abrir menú de navegación"
              >
                {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
              </button>

              <nav className="hidden md:flex items-center space-x-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`text-xs font-bold uppercase tracking-wider relative py-1 transition-colors ${
                        isActive ? "text-gold" : "text-sand-muted hover:text-sand"
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <motion.span
                          layoutId="activeNavIndicator"
                          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* CENTRO: Logo de la Marca */}
            <div className="flex justify-center items-center">
              <Link href="/" className="group flex flex-col items-center select-none text-center">
                <div className="flex items-center space-x-1 justify-center">
                  <span className="text-gold font-title text-base sm:text-lg leading-none font-bold">✦</span>
                  <span className="font-title font-black text-xl sm:text-2xl tracking-[0.25em] text-sand group-hover:text-gold transition-colors pl-1 uppercase">
                    {siteConfig.name}
                  </span>
                </div>
                <span className="text-[7px] sm:text-[8px] text-sand-muted font-bold tracking-[0.3em] uppercase leading-none pt-1">
                  tienda ancestral
                </span>
              </Link>
            </div>

            {/* LADO DERECHO: Buscador, Wishlist, Carrito (Icons) */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-4">
              {/* Instagram o Buscar */}
              <button
                className="text-sand-muted hover:text-gold p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none"
                aria-label="Buscar productos"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Favoritos (Wishlist) */}
              <Link
                href="/catalogo"
                className="hidden sm:flex text-sand-muted hover:text-gold p-2 rounded-full hover:bg-white/5 transition-all"
                aria-label="Ver favoritos"
              >
                <Heart className="w-4.5 h-4.5" />
              </Link>

              {/* Carrito de Compras */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-sand-muted hover:text-gold p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none focus:ring-1 focus:ring-gold"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-white font-bold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-obsidian animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Menú de Navegación Móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[106px] z-30 md:hidden bg-surface border-b border-cream-dark/30 shadow-2xl px-6 py-8 flex flex-col space-y-4"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm uppercase font-bold tracking-wider py-2 border-b border-cream-dark/15 transition-colors ${
                    isActive ? "text-gold pl-2 border-l-2 border-l-gold" : "text-sand-muted"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="flex items-center space-x-4 pt-4">
              <Link
                href="/catalogo"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-sand-muted hover:text-gold text-xs font-bold uppercase tracking-wider"
              >
                <Heart className="w-4.5 h-4.5" />
                <span>Favoritos</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
