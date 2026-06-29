import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Cómo ARÜNA usa cookies y tecnologías similares, y cómo gestionar tu consentimiento.",
  robots: { index: true, follow: true },
};

const { contact } = siteConfig;

export default function CookiesPage() {
  return (
    <LegalShell
      title="Política de Cookies"
      subtitle="Uso de cookies y tecnologías similares."
      actualizado="2026"
    >
      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos que un sitio guarda en tu navegador para recordar información (por ejemplo, el
        contenido de tu carrito) o para entender cómo se usa el sitio.
      </p>

      <h2>2. Tipos de cookies que usamos</h2>
      <ul>
        <li>
          <strong>Esenciales:</strong> necesarias para el funcionamiento del sitio (carrito, sesión). No requieren
          consentimiento.
        </li>
        <li>
          <strong>Analíticas y de medición (opcionales):</strong> nos ayudan a entender el tráfico y mejorar la tienda
          (p. ej. Google Analytics y el Píxel de Meta). Solo se activan si das tu consentimiento.
        </li>
      </ul>

      <h2>3. Tu consentimiento</h2>
      <p>
        Al entrar al sitio verás un aviso para aceptar o rechazar las cookies no esenciales. Las cookies analíticas y de
        medición <strong>no se cargan</strong> hasta que las aceptas. Puedes cambiar tu elección borrando los datos del
        sitio en tu navegador, lo que volverá a mostrar el aviso.
      </p>

      <h2>4. Cómo gestionarlas</h2>
      <p>
        Además del aviso de este sitio, puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta
        que bloquear las esenciales puede afectar el funcionamiento de la tienda.
      </p>

      <h2>5. Contacto</h2>
      <p>
        Si tienes dudas sobre esta política, escríbenos a <a href={`mailto:${contact.email}`}>{contact.email}</a>. Consulta
        también nuestra <a href="/privacidad">Política de Privacidad</a>.
      </p>
    </LegalShell>
  );
}
