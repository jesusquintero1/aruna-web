"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CheckCircle2, Clock, XCircle, Truck } from "lucide-react";

export default function ResultadoClient() {
  const params = useSearchParams();
  const { clearCart } = useCart();

  const status = (params.get("status") || params.get("collection_status") || "").toLowerCase();
  const orderId = params.get("external_reference") || "";

  const aprobado = status === "approved";
  const pendiente = status === "pending" || status === "in_process";
  const fallido = !aprobado && !pendiente;

  // Si el pago fue aprobado o quedó en proceso, vaciamos el carrito (la compra ya entró).
  useEffect(() => {
    if (aprobado || pendiente) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aprobado, pendiente]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white border border-cream-dark rounded-3xl p-8 space-y-4">
        {aprobado && (
          <>
            <CheckCircle2 className="w-20 h-20 text-cactus mx-auto" />
            <h1 className="font-lux font-bold text-3xl text-chocolate">¡Pago confirmado!</h1>
            <p className="text-sm text-chocolate-light">
              {orderId && <>Tu pedido <b className="text-chocolate">{orderId}</b> quedó pagado. </>}
              Gracias por tu compra. Te enviaremos la confirmación y el seguimiento de tu envío.
            </p>
            <div className="bg-caribe-light border border-caribe/20 rounded-2xl p-4 text-caribe-deep text-xs font-bold">
              <Truck className="w-5 h-5 mx-auto mb-1" /> Preparando tu pieza única · te contactaremos para el envío
            </div>
          </>
        )}

        {pendiente && (
          <>
            <Clock className="w-20 h-20 text-sol mx-auto" />
            <h1 className="font-lux font-bold text-3xl text-chocolate">Pago en proceso</h1>
            <p className="text-sm text-chocolate-light">
              {orderId && <>Tu pedido <b className="text-chocolate">{orderId}</b> está </>}
              esperando la confirmación del pago (p. ej. PSE o efectivo). En cuanto se acredite,
              te avisaremos. No es necesario pagar de nuevo.
            </p>
          </>
        )}

        {fallido && (
          <>
            <XCircle className="w-20 h-20 text-flamenco mx-auto" />
            <h1 className="font-lux font-bold text-3xl text-chocolate">El pago no se completó</h1>
            <p className="text-sm text-chocolate-light">
              No se procesó el pago. Tu carrito sigue guardado: puedes intentarlo de nuevo con otro medio de pago.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/catalogo" className="btn-primary px-6 py-3 text-sm uppercase tracking-wider">Seguir comprando</Link>
          <Link href="/" className="btn-secondary px-6 py-3 text-sm uppercase tracking-wider">Ir al inicio</Link>
        </div>
      </div>
    </div>
  );
}
