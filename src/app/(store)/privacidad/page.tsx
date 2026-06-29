import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidad y Tratamiento de Datos",
  description: "Política de tratamiento de datos personales de ARÜNA conforme a la Ley 1581 de 2012 (Habeas Data).",
  robots: { index: true, follow: true },
};

const { legal, contact } = siteConfig;

export default function PrivacidadPage() {
  return (
    <LegalShell
      title="Política de Privacidad y Tratamiento de Datos"
      subtitle="Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Habeas Data)."
      actualizado="2026"
    >
      <p>
        En cumplimiento de la Ley Estatutaria 1581 de 2012 y sus decretos reglamentarios, <strong>{legal.razonSocial}</strong>{" "}
        (NIT <strong>{legal.nit}</strong>), con domicilio en {legal.domicilio} (en adelante “ARÜNA”), informa su política
        de tratamiento de datos personales de quienes interactúan con la tienda <strong>{siteConfig.name}</strong>.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        ARÜNA — {legal.razonSocial}, NIT {legal.nit}, domicilio {legal.domicilio}. Correo de contacto para asuntos de
        datos personales: <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>2. Datos que recolectamos</h2>
      <ul>
        <li>Datos de identificación y contacto: nombre, cédula, teléfono, correo electrónico.</li>
        <li>Datos de envío: dirección, ciudad y departamento.</li>
        <li>Datos de la compra: productos, montos y método de pago (el pago se procesa por la pasarela; ARÜNA no almacena datos de tarjetas).</li>
        <li>Correo electrónico de quienes se suscriben al newsletter.</li>
      </ul>

      <h2>3. Finalidades</h2>
      <ul>
        <li>Procesar, gestionar y entregar los pedidos.</li>
        <li>Contactar al cliente sobre su compra, envío y servicio postventa.</li>
        <li>Enviar comunicaciones comerciales y novedades, únicamente a quienes lo autorizan (newsletter).</li>
        <li>Cumplir obligaciones legales, contables y tributarias.</li>
      </ul>

      <h2>4. Autorización</h2>
      <p>
        Al realizar una compra o suscribirse al newsletter, el titular autoriza de forma libre, previa y expresa el
        tratamiento de sus datos para las finalidades aquí descritas. La suscripción al newsletter requiere aceptar
        explícitamente esta política mediante la casilla de consentimiento.
      </p>

      <h2>5. Derechos del titular</h2>
      <p>Como titular de los datos, usted tiene derecho a:</p>
      <ul>
        <li>Conocer, actualizar y rectificar sus datos personales.</li>
        <li>Solicitar prueba de la autorización otorgada.</li>
        <li>Ser informado sobre el uso que se ha dado a sus datos.</li>
        <li>Revocar la autorización y/o solicitar la supresión de sus datos cuando proceda.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
      </ul>

      <h2>6. Procedimiento para ejercer sus derechos</h2>
      <p>
        Para consultar, actualizar, rectificar, suprimir sus datos o revocar la autorización, envíe una solicitud al
        correo <a href={`mailto:${contact.email}`}>{contact.email}</a> indicando su nombre, identificación y la petición
        concreta. Las consultas se atienden en un máximo de diez (10) días hábiles y los reclamos en un máximo de quince
        (15) días hábiles, conforme a la ley.
      </p>

      <h2>7. Vigencia</h2>
      <p>
        Esta política rige desde {legal.vigenciaDesde}. Los datos se conservarán mientras sean necesarios para las
        finalidades descritas o mientras lo exija la ley. ARÜNA podrá actualizar esta política; los cambios se publicarán
        en esta misma página.
      </p>
    </LegalShell>
  );
}
