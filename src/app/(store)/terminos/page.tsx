import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso y de venta de la tienda ARÜVIA.",
  robots: { index: true, follow: true },
};

const { legal, contact } = siteConfig;

export default function TerminosPage() {
  return (
    <LegalShell
      title="Términos y Condiciones"
      subtitle="Condiciones de uso del sitio y de venta de productos."
      actualizado="2026"
    >
      <h2>1. Identificación del comerciante</h2>
      <p>
        Este sitio es operado por <strong>{legal.razonSocial}</strong> (NIT <strong>{legal.nit}</strong>), con domicilio
        en {legal.domicilio}. Contacto: <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>2. Objeto</h2>
      <p>
        ARÜVIA comercializa mochilas y artesanías Wayuu tejidas a mano. Al usar este sitio y realizar una compra, usted
        acepta estos términos y la <a href="/privacidad">Política de Privacidad</a>.
      </p>

      <h2>3. Productos y precios</h2>
      <ul>
        <li>Cada pieza es artesanal y única; pueden existir variaciones naturales de color y textura respecto a las fotos.</li>
        <li>Los precios están expresados en pesos colombianos (COP) e incluyen los impuestos aplicables, salvo que se indique lo contrario.</li>
        <li>ARÜVIA puede modificar precios y disponibilidad en cualquier momento; el precio aplicable es el vigente al momento de la compra.</li>
      </ul>

      <h2>4. Proceso de compra y pago</h2>
      <p>
        El pedido se confirma una vez aprobado el pago. Los pagos en línea se procesan mediante una pasarela de pagos
        autorizada (Mercado Pago); ARÜVIA no almacena los datos financieros del cliente. Un pedido puede ser cancelado si
        se detecta un error de precio evidente, falta de stock o sospecha de fraude.
      </p>

      <h2>5. Envíos</h2>
      <p>
        Los tiempos y costos de envío se informan durante la compra. {siteConfig.shipping.national}. Los tiempos son
        estimados y pueden variar por causas ajenas a ARÜVIA (transportadora, zona de entrega, fuerza mayor).
      </p>

      <h2>6. Cambios, devoluciones y garantía</h2>
      <p>
        Aplican las condiciones descritas en la página de <a href="/devoluciones">Cambios y Devoluciones</a>, conforme a
        la Ley 1480 de 2011 (Estatuto del Consumidor).
      </p>

      <h2>7. Propiedad intelectual</h2>
      <p>
        Las marcas, textos, imágenes y diseños del sitio pertenecen a ARÜVIA o a sus titulares y no pueden reproducirse sin
        autorización.
      </p>

      <h2>8. Responsabilidad</h2>
      <p>
        ARÜVIA no será responsable por daños indirectos derivados del uso del sitio. Nada en estos términos limita los
        derechos que la ley reconoce al consumidor.
      </p>

      <h2>9. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se resolverá ante las
        autoridades competentes del domicilio del comerciante en {legal.ciudad}.
      </p>
    </LegalShell>
  );
}
