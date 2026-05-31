"use client";

import React, { useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice, getCartWhatsappLink } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera del panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node) &&
        isCartOpen
      ) {
        setIsCartOpen(false);
      }
    }

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Evitar scroll en el body cuando el carrito está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, setIsCartOpen]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const whatsappUrl = getCartWhatsappLink(cart);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Fondo oscuro traslúcido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-carbon/80 z-50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Panel lateral deslizante */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-arena border-l border-arena-oscura/50 z-50 shadow-2xl flex flex-col h-full"
          >
            {/* Cabecera */}
            <div className="p-5 border-b border-arena-oscura/30 flex items-center justify-between bg-arena-oscura/10">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-cardenal" />
                <span className="font-display font-bold text-lg text-carbon">Tu Carrito</span>
                {cartCount > 0 && (
                  <span className="bg-cardenal text-arena text-xs px-2 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-carbon hover:text-cardenal p-1 rounded-full hover:bg-arena-oscura/20 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lista de productos (Scrollable) */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="p-4 bg-arena-oscura/20 rounded-full text-carbon/40">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-carbon">Tu carrito está vacío</h3>
                  <p className="text-sm text-carbon/70 max-w-xs">
                    Explora nuestra colección y añade mochilas tejidas con alma a tu colección.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 bg-cardon text-arena px-6 py-2.5 rounded-full font-medium hover:bg-cardon/90 transition-all shadow-md text-sm"
                  >
                    Seguir explorando
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-4 bg-arena-oscura/10 p-3 rounded-xl border border-arena-oscura/20 hover:border-arena-oscura/40 transition-all group"
                  >
                    {/* Imagen del producto */}
                    <div className="relative w-20 h-20 bg-arena-oscura/20 rounded-lg overflow-hidden flex-shrink-0 border border-arena-oscura/30">
                      <Image
                        src={item.product.imagenes[0]}
                        alt={item.product.nombre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="80px"
                      />
                    </div>

                    {/* Información y cantidad */}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-display font-bold text-sm text-carbon truncate">
                        {item.product.nombre}
                      </h4>
                      <p className="text-xs text-carbon/60 mb-2 truncate">
                        {item.product.colores.join(" · ")}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {/* Selector de cantidad */}
                        <div className="flex items-center border border-arena-oscura/40 rounded-full bg-arena">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-carbon/60 hover:text-cardenal transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-carbon">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-carbon/60 hover:text-cardenal transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        {/* Precio total por item */}
                        <span className="text-sm font-semibold text-carbon font-mono">
                          {formatPrice(item.product.precio * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-carbon/40 hover:text-cardenal p-1 rounded-lg hover:bg-arena-oscura/20 transition-colors self-start"
                      aria-label="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pie de Carrito (Resumen y CTAs) */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-arena-oscura/30 bg-arena-oscura/10 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-carbon/70">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-cardon font-medium">
                    <span>Envío nacional (Colombia)</span>
                    <span className="uppercase font-bold text-xs">Gratis</span>
                  </div>
                  <WayuuDivider className="py-2 opacity-50 text-arena-oscura" />
                  <div className="flex justify-between text-base font-bold text-carbon">
                    <span>Total estimado</span>
                    <span className="text-lg font-display text-cardenal font-mono">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center space-x-2 bg-cardenal text-arena py-3.5 rounded-full font-bold hover:bg-cardenal/90 hover:scale-[1.01] active:scale-95 transition-all duration-300 shadow-lg text-sm uppercase tracking-wider"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>Pedir por WhatsApp</span>
                  </button>
                  <p className="text-[10px] text-center text-carbon/60">
                    Tu pedido será enviado detallado a nuestro asesor de ventas en WhatsApp.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Separador sutil para los precios en el footer
function WayuuDivider({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={`w-full py-1 flex items-center justify-center overflow-hidden ${className}`} {...props}>
      <div className="flex-grow h-[1px] bg-current opacity-25"></div>
      <div className="mx-2 flex space-x-0.5 text-current opacity-40">
        <span className="w-1.5 h-1.5 bg-current rotate-45"></span>
      </div>
      <div className="flex-grow h-[1px] bg-current opacity-25"></div>
    </div>
  );
}
