import { getSettings } from "@/lib/db/settings";
import InfografiaForm from "@/components/admin/InfografiaForm";

export const dynamic = "force-dynamic";

/** Contenido editable del sitio: infografías al pie del catálogo de cada línea. */
export default async function AdminContenido() {
  const settings = await getSettings(["infografia_mochilas", "infografia_maquillaje"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-lux font-bold text-3xl text-chocolate">Contenido de la tienda</h1>
        <p className="text-sm text-chocolate-light">
          Imágenes informativas que aparecen en la parte inferior del catálogo de cada línea.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <InfografiaForm
          linea="mochilas"
          titulo="Guía de tallas · Mochilas"
          descripcion="Se muestra al final de /catalogo. Ideal: la imagen de referencia de tallas de mochilas."
          imagenActual={settings.infografia_mochilas}
        />
        <InfografiaForm
          linea="maquillaje"
          titulo="Infografía · Maquillaje"
          descripcion="Se muestra al final de /maquillaje. Puede ser una guía de tonos, uso o cuidados."
          imagenActual={settings.infografia_maquillaje}
        />
      </div>
    </div>
  );
}
