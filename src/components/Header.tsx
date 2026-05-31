"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X } from "lucide-react";

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
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();

  // Cambiar color de fondo al hacer scroll
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
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-obsidian/85 backdrop-blur-md shadow-lg py-3.5 border-b border-white/5"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-1">
            <span className="text-gold animate-pulseLogo font-title text-2xl mr-1.5 font-bold">✦</span>
            <span className="font-title font-bold text-xl sm:text-2xl tracking-widest text-sand group-hover:text-gold transition-colors">
              {siteConfig.name}
            </span>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-semibold tracking-wide relative py-1 transition-colors ${
                    isActive ? "text-gold" : "text-sand-muted hover:text-sand"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Acciones */}
          <div className="flex items-center space-x-4">
            {/* Instagram de la marca */}
            <a
              href={siteConfig.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex text-sand-muted hover:text-gold p-2 rounded-full hover:bg-white/5 transition-all"
              aria-label="Instagram de Aruna"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>

            {/* Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-sand-muted hover:text-gold p-2.5 rounded-full hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-obsidian font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-obsidian animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Menú Hamburgesa Móvil */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-sand-muted hover:text-gold p-2.5 rounded-full hover:bg-white/5 transition-all focus:outline-none"
              aria-label="Abrir menú de navegación"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú de Navegación Móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[70px] z-30 md:hidden bg-surface border-b border-white/5 shadow-2xl px-4 py-6 flex flex-col space-y-4"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-title font-bold py-2 border-b border-white/5 transition-colors ${
                    isActive ? "text-gold font-bold px-2 border-l-4 border-l-gold" : "text-sand-muted px-2"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="flex items-center space-x-4 pt-4 px-2">
              <a
                href={siteConfig.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sand-muted hover:text-gold"
              >
                <InstagramIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Síguenos en Instagram</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
