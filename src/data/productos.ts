/**
 * SISTEMA DE PRODUCTOS "ARUNA" - LISTO PARA EDITAR
 * 
 * Sigue estos sencillos pasos para agregar, modificar o eliminar productos en tu tienda:
 * 
 * PASO 1: Consigue las fotografías de tu producto.
 *         Sube las imágenes a la carpeta `/public/productos/` o `/public/images/` en tu proyecto.
 *         Se recomienda que las fotos sean cuadradas o verticales (relación de aspecto 1:1 o 3:4) y tengan fondo limpio.
 * 
 * PASO 2: Abre este archivo y agrega un nuevo objeto al array `productos` a continuación.
 *         Copia y pega uno de los ejemplos existentes y edita sus propiedades:
 * 
 *         - `id`: Un identificador único corto, sin espacios ni caracteres especiales. Ejemplo: "mochila-sususu"
 *         - `nombre`: El título del producto que verán tus clientes. Ejemplo: "Mochila Sususu Terracota"
 *         - `precio`: El precio de venta en pesos colombianos (COP) como número entero. Ejemplo: 280000
 *         - `precioAnterior`: (Opcional) Precio original si tiene descuento. Muestra un tachado tachado. Ejemplo: 340000
 *         - `imagenes`: Array de rutas a las imágenes. La primera será la principal.
 *                      Puedes usar rutas locales como "/images/mochila_cardenal.png" o URLs completas.
 *         - `descripcion`: Párrafo descriptivo donde explicas el significado de su tejido, dimensiones y materiales.
 *         - `colores`: Colores predominantes en el tejido para que la gente los conozca. Ejemplo: ["Terracota", "Crema", "Marrón"]
 *         - `categoria`: La categoría del producto. Por defecto "mochilas".
 *         - `disponible`: `true` si se puede comprar, `false` si ya se vendió (mostrará etiqueta "Agotada").
 *         - `destacado`: `true` para que aparezca en la página de inicio en la sección de destacados.
 *         - `simbolo`: El símbolo sagrado que inspiró el tejido. Puede ser: "colibri", "flamenco", "cardenal", "cactus", "lirios", "delfines".
 */

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  precioAnterior?: number;
  imagenes: string[];
  descripcion: string;
  colores: string[];
  categoria: string;
  disponible: boolean;
  destacado: boolean;
  simbolo: "colibri" | "flamenco" | "cardenal" | "cactus" | "lirios" | "delfines";
}

export const productos: Producto[] = [
  {
    id: "mochila-arutka-cardenal",
    nombre: "Mochila Arutka Cardenal",
    precio: 290000,
    precioAnterior: 350000,
    imagenes: [
      "/images/mochila_cardenal.png",
      "/images/mochila_colibri.png"
    ],
    descripcion: "Tejida en un profundo color Cardenal combinado con tonos arena, la mochila Arutka representa los caminos del desierto guajiro. Su diseño de un solo hilo (hebra fina) requiere 25 días de minucioso trabajo. Los Kanas (patrones geométricos) en el cuerpo simbolizan el caparazón de la tortuga (Irapa), portador de la sabiduría y resiliencia de la cultura Wayuu.",
    colores: ["Cardenal Rojo", "Arena Cálida", "Negro Carbón"],
    categoria: "Mochila Un Hilo",
    disponible: true,
    destacado: true,
    simbolo: "cardenal"
  },
  {
    id: "mochila-iguaraya-desierto",
    nombre: "Mochila Iguaraya Desierto",
    precio: 320000,
    imagenes: [
      "/images/mochila_iguaraya.png",
      "/images/mochila_cardenal.png"
    ],
    descripcion: "Inspirada en el verde del cactus Cardón y los tonos terracota de los atardeceres de Maicao, la mochila Iguaraya es una oda a la flora de La Guajira. Esta pieza cuenta con una gasa tejida en telar tradicional que se adapta cómodamente a tu hombro, distribuyendo el peso de manera ideal. Perfecta para un estilo bohemio, sofisticado y auténtico.",
    colores: ["Verde Cardón", "Terracota", "Crema"],
    categoria: "Mochila Un Hilo",
    disponible: true,
    destacado: true,
    simbolo: "cactus"
  },
  {
    id: "mochila-caribe-flamenco",
    nombre: "Mochila Caribe Flamenco",
    precio: 280000,
    precioAnterior: 310000,
    imagenes: [
      "/images/mochila_flamenco.png",
      "/images/mochila_colibri.png"
    ],
    descripcion: "Una explosión de colores que fusiona el azul profundo del mar Caribe con el rosa vibrante de los flamencos del Santuario de Flora y Fauna de la Guajira. Su diseño representa el Molokonoutshi (las costillas del caimán) en una combinación alegre y dinámica. Un testimonio vivo de alegría y tradición hecho de algodón premium de alta resistencia.",
    colores: ["Flamenco Rosa", "Azul Caribe", "Amarillo Sol"],
    categoria: "Mochila Un Hilo",
    disponible: true,
    destacado: true,
    simbolo: "flamenco"
  },
  {
    id: "mochila-sususu-crema-agotada",
    nombre: "Mochila Sususu Crema",
    precio: 295000,
    imagenes: [
      "/images/mochila_colibri.png"
    ],
    descripcion: "De elegancia sobria y colores neutros, esta mochila representa la pureza de la arena de la Alta Guajira. Los patrones Kanas se muestran en un beige suave sobre un fondo crema crudo natural. Una pieza sumamente combinable, versátil y atemporal.",
    colores: ["Crema Natural", "Arena Oscura", "Blanco"],
    categoria: "Mochila Un Hilo",
    disponible: false, // ETIQUETA AGOTADA
    destacado: false,
    simbolo: "colibri"
  }
];
