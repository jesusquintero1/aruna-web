"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Calculator, LogOut, Menu, X, Store, Truck, BarChart3,
  ShoppingBasket, Sparkles, ImageIcon,
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Mochilas", href: "/admin/mochilas", icon: ShoppingBasket },
  { name: "Maquillaje", href: "/admin/maquillaje", icon: Sparkles },
  { name: "Analítica", href: "/admin/analitica", icon: BarChart3 },
  { name: "Productos", href: "/admin/productos", icon: Package },
  { name: "Compras", href: "/admin/compras", icon: Truck },
  { name: "Categorías", href: "/admin/categorias", icon: Tags },
  { name: "Contenido", href: "/admin/contenido", icon: ImageIcon },
  { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
  { name: "POS · Vender", href: "/admin/pos", icon: Calculator },
];

export default function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Barra superior móvil */}
      <div className="md:hidden flex items-center justify-between bg-carbon text-white px-4 py-3 sticky top-0 z-40">
        <span className="font-lux font-bold tracking-widest">ARÜNA · Admin</span>
        <button onClick={() => setOpen(!open)} aria-label="Menú">{open ? <X /> : <Menu />}</button>
      </div>

      <aside className={`${open ? "block" : "hidden"} md:block fixed md:sticky top-0 left-0 z-30 w-64 h-screen bg-carbon text-white flex-shrink-0`}>
        <div className="flex flex-col h-full p-4">
          <div className="px-3 py-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-gold-lux">✦</span>
              <span className="font-lux font-bold text-xl tracking-[0.2em] uppercase">ARÜNA</span>
            </div>
            <p className="text-[10px] text-white/40 font-bold tracking-[0.3em] uppercase mt-1">Administración</p>
          </div>

          <nav className="flex-grow space-y-1">
            {links.map((l) => {
              const active = isActive(l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active ? "bg-gold-lux text-carbon" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <l.icon className="w-4.5 h-4.5" /> {l.name}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 pt-4 border-t border-white/10">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors">
              <Store className="w-4.5 h-4.5" /> Ver tienda
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-flamenco-claro hover:bg-flamenco/15 transition-colors">
                <LogOut className="w-4.5 h-4.5" /> Salir ({username})
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
