"use client";

import React, { useRef, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice, getCartWhatsappLink } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, Info } from "lucide-react";
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
  const [showInfoModal, setShowInfoModal] = useState(false);

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
    setShowInfoModal(true);
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
                    className="w-full flex items-center justify-center space-x-2 bg-chocolate text-white py-3.5 rounded-full font-bold hover:bg-gold hover:text-obsidian hover:scale-[1.01] active:scale-95 transition-all duration-300 shadow-lg text-sm uppercase tracking-wider cursor-pointer"
                  >
                    <span>Finalizar Compra</span>
                  </button>
                  <p className="text-[10px] text-center text-carbon/60">
                    Completa tu pedido de forma segura y directa en línea.
                  </p>
                </div>
              </div>
            )}

            {/* Modal de información sobre canales de venta */}
            <AnimatePresence>
              {showInfoModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-carbon/65 backdrop-blur-md z-[60] flex items-center justify-center p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    className="bg-surface border border-cream-dark p-8 rounded-[32px] max-w-sm space-y-6 shadow-2xl relative"
                  >
                    <button
                      onClick={() => setShowInfoModal(false)}
                      className="absolute top-4 right-4 text-chocolate-light hover:text-cardenal p-1 rounded-full transition-colors cursor-pointer"
                      aria-label="Cerrar aviso"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <div className="w-14 h-14 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto text-terracotta">
                      <Info className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] uppercase font-black tracking-widest text-terracotta font-title block">
                        Canales en Configuración
                      </span>
                      <h3 className="font-title font-black text-xl text-chocolate uppercase tracking-wide">
                        Muy Pronto
                      </h3>
                      <p className="text-xs text-chocolate-light leading-relaxed font-semibold">
                        Estamos ajustando nuestros canales oficiales y pasarelas de pago. Muy pronto podrás completar tu pedido directamente en línea. ¡Agradecemos tu paciencia y apoyo a nuestras maestras tejedoras!
                      </p>
                    </div>

                    <button
                      onClick={() => setShowInfoModal(false)}
                      className="w-full bg-chocolate hover:bg-gold text-white py-3 rounded-full font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                    >
                      Entendido
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
