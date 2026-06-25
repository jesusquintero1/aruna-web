"use client";

import React, { useRef, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, CheckCircle2, Truck, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type View = "cart" | "checkout" | "success";

const paymentMethods = ["Nequi", "Daviplata", "Bancolombia", "Tarjeta", "Contra entrega"];

export default function CartDrawer() {
  const {
    cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart,
    cartTotal, cartCount, clearCart,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("cart");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre: "", telefono: "", email: "", ciudad: "", direccion: "", pago: "Nequi",
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node) && isCartOpen) {
        setIsCartOpen(false);
      }
    }
    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, setIsCartOpen]);

  // Reiniciar a la vista de carrito al cerrar (tras un pequeño retraso)
  useEffect(() => {
    if (!isCartOpen) {
      const t = setTimeout(() => { if (view !== "cart") setView("cart"); }, 300);
      return () => clearTimeout(t);
    }
  }, [isCartOpen, view]);

  const formValid =
    form.nombre.trim() && form.telefono.trim() && form.ciudad.trim() && form.direccion.trim();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ product_id: i.product.id, cantidad: i.quantity })),
          metodoPago: form.pago,
          cliente: {
            nombre: form.nombre,
            telefono: form.telefono,
            email: form.email,
            ciudad: form.ciudad,
            direccion: form.direccion,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo procesar el pedido.");
      setOrderId(data.id);
      clearCart();
      setView("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-carbon/80 z-50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-cream z-50 shadow-2xl flex flex-col h-full"
          >
            {/* Cabecera */}
            <div className="p-5 border-b border-cream-dark flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                {view === "checkout" && (
                  <button onClick={() => setView("cart")} className="text-chocolate hover:text-caribe p-1" aria-label="Volver">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <ShoppingBag className="w-5 h-5 text-flamenco" />
                <span className="font-title font-black text-lg text-chocolate">
                  {view === "cart" && "Tu carrito"}
                  {view === "checkout" && "Finalizar compra"}
                  {view === "success" && "¡Pedido confirmado!"}
                </span>
                {view === "cart" && cartCount > 0 && (
                  <span className="bg-flamenco text-white text-xs px-2 py-0.5 rounded-full font-black">{cartCount}</span>
                )}
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-chocolate hover:text-flamenco p-1 rounded-full hover:bg-cream-dark/40 transition-colors" aria-label="Cerrar">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ===================== VISTA: CARRITO ===================== */}
            {view === "cart" && (
              <>
                <div className="flex-grow overflow-y-auto p-5 space-y-4 no-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                      <div className="p-5 bg-cream-dark/40 rounded-full text-chocolate/40">
                        <ShoppingBag className="w-12 h-12" />
                      </div>
                      <h3 className="font-title font-black text-lg text-chocolate">Tu carrito está vacío</h3>
                      <p className="text-sm text-chocolate-light max-w-xs">
                        Explora nuestra colección y añade mochilas tejidas con alma.
                      </p>
                      <button onClick={() => setIsCartOpen(false)} className="btn-secondary px-6 py-3 text-sm">
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
                        className="flex gap-4 bg-white p-3 rounded-2xl border border-cream-dark group"
                      >
                        <div className="relative w-20 h-20 bg-cream-dark/20 rounded-xl overflow-hidden flex-shrink-0">
                          <Image src={item.product.imagenes[0]} alt={item.product.nombre} fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-title font-bold text-sm text-chocolate truncate">{item.product.nombre}</h4>
                          <p className="text-xs text-chocolate-light mb-2 truncate">{item.product.colores.join(" · ")}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-cream-dark rounded-full bg-cream">
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 text-chocolate-light hover:text-flamenco" aria-label="Menos">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-sm font-black text-chocolate">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 text-chocolate-light hover:text-caribe" aria-label="Más">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-black text-chocolate">{formatPrice(item.product.precio * item.quantity)}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-chocolate/30 hover:text-flamenco p-1 self-start" aria-label="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-5 border-t border-cream-dark bg-white space-y-3">
                    <div className="flex justify-between text-sm text-chocolate-light">
                      <span>Subtotal</span>
                      <span className="font-bold">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-cactus font-bold">
                      <span>Envío nacional</span>
                      <span className="uppercase">Gratis</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-chocolate border-t border-cream-dark pt-3">
                      <span>Total</span>
                      <span className="text-flamenco">{formatPrice(cartTotal)}</span>
                    </div>
                    <button onClick={() => setView("checkout")} className="btn-primary w-full py-4 text-sm uppercase tracking-wider">
                      Finalizar compra
                    </button>
                    <p className="flex items-center justify-center gap-1.5 text-[11px] text-chocolate-light font-semibold">
                      <Lock className="w-3.5 h-3.5" /> Compra segura · Datos protegidos
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ===================== VISTA: CHECKOUT ===================== */}
            {view === "checkout" && (
              <form onSubmit={handlePlaceOrder} className="flex flex-col h-full overflow-hidden">
                <div className="flex-grow overflow-y-auto p-5 space-y-4 no-scrollbar">
                  <div className="bg-caribe-light border border-caribe/20 rounded-2xl p-3 flex items-center gap-2 text-caribe-deep text-xs font-bold">
                    <Truck className="w-4 h-4" /> Envío gratis · Entrega en 2–5 días hábiles
                  </div>

                  <Field label="Nombre completo *" value={form.nombre} onChange={set("nombre")} placeholder="Ej. María Restrepo" />
                  <Field label="WhatsApp / Teléfono *" value={form.telefono} onChange={set("telefono")} placeholder="Ej. 300 123 4567" type="tel" />
                  <Field label="Correo electrónico" value={form.email} onChange={set("email")} placeholder="tucorreo@email.com" type="email" />
                  <Field label="Ciudad *" value={form.ciudad} onChange={set("ciudad")} placeholder="Ej. Bogotá" />
                  <Field label="Dirección de entrega *" value={form.direccion} onChange={set("direccion")} placeholder="Calle, número, barrio, apto" />

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wide text-chocolate">Método de pago</label>
                    <select value={form.pago} onChange={set("pago")} className="w-full bg-white border border-cream-dark rounded-xl px-4 py-3 text-sm text-chocolate font-semibold focus:outline-none focus:border-caribe">
                      {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Resumen del pedido */}
                  <div className="bg-white border border-cream-dark rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wide text-chocolate-light">Resumen ({cartCount} piezas)</p>
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-xs text-chocolate">
                        <span className="truncate pr-2">{item.quantity}× {item.product.nombre}</span>
                        <span className="font-bold flex-shrink-0">{formatPrice(item.product.precio * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-base font-black text-chocolate border-t border-cream-dark pt-2">
                      <span>Total</span>
                      <span className="text-flamenco">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-cream-dark bg-white space-y-2">
                  {error && (
                    <p className="text-sm text-flamenco font-semibold text-center bg-flamenco-light rounded-xl py-2">{error}</p>
                  )}
                  <button type="submit" disabled={!formValid || submitting} className="btn-primary w-full py-4 text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0">
                    {submitting ? "Procesando…" : `Confirmar pedido · ${formatPrice(cartTotal)}`}
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-chocolate-light font-semibold">
                    <Lock className="w-3.5 h-3.5" /> Te contactaremos para coordinar el pago
                  </p>
                </div>
              </form>
            )}

            {/* ===================== VISTA: ÉXITO ===================== */}
            {view === "success" && (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 gap-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                  <CheckCircle2 className="w-20 h-20 text-cactus" />
                </motion.div>
                <h3 className="font-title font-black text-2xl text-chocolate">¡Gracias por tu compra!</h3>
                <p className="text-sm text-chocolate-light max-w-xs">
                  Tu pedido <b className="text-chocolate">{orderId}</b> fue recibido. Nos pondremos en contacto por WhatsApp para coordinar el pago y el envío.
                </p>
                <div className="bg-caribe-light border border-caribe/20 rounded-2xl p-4 text-caribe-deep text-xs font-bold w-full max-w-xs">
                  <Truck className="w-5 h-5 mx-auto mb-1" />
                  Envío gratis en camino · 2–5 días hábiles
                </div>
                <button onClick={() => setIsCartOpen(false)} className="btn-secondary px-8 py-3 text-sm mt-2">
                  Seguir explorando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-wide text-chocolate">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white border border-cream-dark rounded-xl px-4 py-3 text-sm text-chocolate font-semibold placeholder:text-chocolate-light/50 placeholder:font-normal focus:outline-none focus:border-caribe"
      />
    </div>
  );
}
