/**
 * SISTEMA DE PRODUCTOS "ARÜNA" - LISTO PARA EDITAR
 *
 * IMPORTANTE: La tienda lee los productos desde la base de datos (Supabase).
 * Este archivo es la fuente para el seed (`npm run seed:products`) y el fallback
 * en modo demo. Para que un cambio aquí se refleje en la tienda en vivo hay que
 * correr el seed o editar el producto desde el panel /admin.
 *
 * Para agregar un producto, copia uno de los objetos del array `productos` y edita:
 *   - `id`: identificador único corto, sin espacios. Ej: "mochila-bordada-champagne"
 *   - `nombre`: título visible. Ej: "Mochila Bordada Champagne"
 *   - `precio`: precio de venta en COP (entero). Ej: 450000
 *   - `precioAnterior`: (opcional) precio original tachado.
 *   - `imagenes`: rutas a las fotos. La primera es la principal. Ej: "/productos/foo.jpg"
 *   - `descripcion`: párrafo con el significado del tejido, materiales y detalles.
 *   - `colores`: colores predominantes. Ej: ["Marfil", "Dorado", "Perla"]
 *   - `categoria`: agrupa el producto. Ej: "Edición Bordada de Lujo"
 *   - `disponible`: true si se puede comprar, false para etiqueta "Agotada".
 *   - `destacado`: true para mostrarlo en la página de inicio.
 *   - `simbolo`: "colibri" | "flamenco" | "cardenal" | "cactus" | "lirios" | "delfines"
 */

export type LineaProducto = "mochilas" | "maquillaje";

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  precioAnterior?: number;
  imagenes: string[];
  /** Videos del producto (URLs públicas). Opcional: los hardcodeados no tienen. */
  videos?: string[];
  descripcion: string;
  colores: string[];
  categoria: string;
  disponible: boolean;
  destacado: boolean;
  simbolo: "colibri" | "flamenco" | "cardenal" | "cactus" | "lirios" | "delfines";
  /** Línea de producto. Los hardcodeados son todos mochilas. */
  linea?: LineaProducto;
}

export const productos: Producto[] = [
  {
    id: "mochila-bordada-champagne",
    nombre: "Mochila Bordada Champagne",
    precio: 450000,
    imagenes: [
      "/productos/bordada-champagne-1.jpg",
      "/productos/bordada-champagne-2.jpg",
      "/productos/bordada-champagne-3.jpg"
    ],
    descripcion: "Una pieza de alta joyería textil. Sobre una base tejida a mano en marfil, las maestras aplican un bordado de encaje con lentejuelas y perlas doradas cosidas una a una, creando un jardín de flores que atrapa la luz. Rematada con borlas en hilo crudo y cuentas perladas. Es la mochila ideal para una novia, una velada especial o quien busca una pieza irrepetible de lujo artesanal.",
    colores: ["Marfil", "Dorado Champagne", "Perla"],
    categoria: "Edición Bordada de Lujo",
    disponible: true,
    destacado: true,
    simbolo: "lirios"
  },
  {
    id: "mochila-bordada-cacao",
    nombre: "Mochila Bordada Cacao",
    precio: 450000,
    imagenes: [
      "/productos/bordada-cacao-1.jpg",
      "/productos/bordada-cacao-2.jpg",
      "/productos/bordada-cacao-3.jpg"
    ],
    descripcion: "Elegancia en tono tierra. Tejida en un cálido color cacao y vestida con un bordado de mostacilla y canutillo dorado que dibuja un gran medallón solar, símbolo de la energía de La Guajira. Las perlas cobre y los detalles en relieve le dan textura y profundidad. Sus borlas en hilo a tono y cuentas perladas completan una pieza sobria, sofisticada y profundamente artesanal.",
    colores: ["Cacao", "Oro Viejo", "Cobre"],
    categoria: "Edición Bordada de Lujo",
    disponible: true,
    destacado: true,
    simbolo: "lirios"
  },
  {
    id: "mochila-bordada-oro-rosa",
    nombre: "Mochila Bordada Oro Rosa",
    precio: 450000,
    imagenes: [
      "/productos/bordada-oro-rosa-1.jpg",
      "/productos/bordada-oro-rosa-2.jpg",
      "/productos/bordada-oro-rosa-3.jpg"
    ],
    descripcion: "Romanticismo tejido. Sobre una base crema, un delicado bordado de lentejuelas en oro rosa forma flores y enredaderas, acentuadas con perlas doradas y nacaradas. El brillo cobrizo y rosado le da un aire moderno y femenino sin perder la raíz ancestral. Acabada con borlas blancas y cuentas perladas: una pieza luminosa, única y llena de detalle.",
    colores: ["Crema", "Oro Rosa", "Perla"],
    categoria: "Edición Bordada de Lujo",
    disponible: true,
    destacado: true,
    simbolo: "lirios"
  },
  {
    id: "mochila-luxe-plata",
    nombre: "Mochila Luxe Plata",
    precio: 320000,
    imagenes: [
      "/productos/luxe-plata-1.jpg",
      "/productos/luxe-plata-2.jpg"
    ],
    descripcion: "Minimalismo con brillo. Tejida a mano en hilo metalizado plata, esta mochila de líneas limpias y silueta perfecta prescinde de patrones para dejar que el material hable por sí solo. Su tejido apretado y uniforme refleja la luz con un sutil destello. Atemporal y versátil, combina lo mismo con un look casual de día que con un atuendo de noche.",
    colores: ["Plata", "Gris Perla"],
    categoria: "Mochila Luxe Lisa",
    disponible: true,
    destacado: false,
    simbolo: "colibri"
  },
  {
    id: "mochila-luxe-champagne",
    nombre: "Mochila Luxe Champagne",
    precio: 320000,
    imagenes: [
      "/productos/luxe-champagne-1.jpg",
      "/productos/luxe-champagne-2.jpg"
    ],
    descripcion: "Elegancia discreta en dorado suave. Tejida a mano en hilo metalizado color champagne, de silueta impecable y acabado liso que realza el brillo natural del material. Una pieza sobria y luminosa a la vez, pensada para quien prefiere el lujo silencioso. Su cordón de ajuste y pompones a tono rematan un diseño elegante y fácil de combinar.",
    colores: ["Champagne", "Dorado Claro"],
    categoria: "Mochila Luxe Lisa",
    disponible: true,
    destacado: false,
    simbolo: "delfines"
  },
  {
    id: "mochila-kana-arena",
    nombre: "Mochila Kana Arena",
    precio: 290000,
    imagenes: [
      "/productos/kana-arena-1.jpg",
      "/productos/kana-arena-2.jpg",
      "/productos/kana-arena-3.jpg"
    ],
    descripcion: "Tradición pura en tonos neutros. Tejida en la técnica clásica de dos hilos, luce Kanas (patrones geométricos ancestrales) en color arena sobre fondo blanco, una paleta serena y elegante que combina con todo. Rematada con gruesos pompones en hilo crudo y su característica gaza trenzada. Una mochila Wayuu auténtica, resistente y atemporal, hecha para acompañarte por años.",
    colores: ["Arena", "Blanco Hueso", "Beige"],
    categoria: "Mochila Dos Hilos",
    disponible: true,
    destacado: false,
    simbolo: "cactus"
  }
];
