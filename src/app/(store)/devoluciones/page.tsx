import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cambios y Devoluciones",
  description: "Política de cambios, devoluciones, derecho de retracto y garantía legal de ARÜVIA (Ley 1480 de 2011).",
  robots: { index: true, follow: true },
};

const { contact } = siteConfig;

export default function DevolucionesPage() {
  return (
    <LegalShell
      title="Cambios y Devoluciones"
      subtitle="Conforme a la Ley 1480 de 2011 (Estatuto del Consumidor)."
      actualizado="2026"
    >
      <h2>1. Derecho de retracto</h2>
      <p>
        En las ventas realizadas a distancia (por internet), el consumidor tiene <strong>derecho de retracto</strong> y
        puede cancelar la compra dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la entrega del
        producto, conforme al artículo 47 de la Ley 1480 de 2011. El producto debe devolverse en las mismas condiciones
        en que se recibió. ARÜVIA reintegrará el dinero pagado a más tardar dentro de los treinta (30) días calendario
        siguientes. Los costos de transporte de la devolución corren por cuenta del consumidor, salvo disposición legal
        en contrario.
      </p>

      <h2>2. Garantía legal</h2>
      <p>
        Todos los productos cuentan con la garantía legal prevista en la Ley 1480 de 2011. Si la pieza presenta un
        defecto de fabricación, tienes derecho a la reparación, reposición o devolución del dinero según corresponda.
      </p>

      <h2>3. Cómo solicitar un cambio o devolución</h2>
      <ul>
        <li>Escríbenos a <a href={`mailto:${contact.email}`}>{contact.email}</a> indicando el número de pedido y el motivo.</li>
        <li>Adjunta fotos si se trata de un defecto.</li>
        <li>Te indicaremos los pasos para el envío de retorno y/o la reposición.</li>
      </ul>

      <h2>4. Condiciones</h2>
      <ul>
        <li>El producto debe estar sin uso, con sus etiquetas y empaque original.</li>
        <li>Por ser piezas artesanales únicas, las variaciones naturales de color y textura no se consideran defectos.</li>
        <li>Para retracto, el plazo es de 5 días hábiles desde la entrega; para defectos de fábrica, aplica la garantía legal.</li>
      </ul>

      <h2>5. Reembolsos</h2>
      <p>
        Una vez recibido y verificado el producto devuelto, el reembolso se realiza por el mismo medio de pago utilizado
        en la compra, dentro de los plazos legales.
      </p>
    </LegalShell>
  );
}
