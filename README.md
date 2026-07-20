# 🌺 ARÜVIA — Tienda Online de Mochilas Wayuu Premium

Bienvenido a la base de código de **ARÜVIA**, la mejor tienda online de artesanías y mochilas Wayuu de La Guajira, Colombia. Este proyecto ha sido construido por **Antigravity** con un enfoque de alto premium, diseño mobile-first, animaciones fluidas y optimización SEO líder en su nicho para maximizar las conversiones de venta directa mediante **WhatsApp** y un **Carrito de Compras** ligero.

El sitio está estructurado para que el dueño de la tienda no tenga que tocar código de programación; solo necesita editar un archivo de texto para agregar productos y cambiar la configuración de contacto.

---

## 🚀 Inicio Rápido (Desarrollo Local)

Para correr el proyecto en tu máquina local, asegúrate de tener instalado [Node.js](https://nodejs.org/) y sigue estos sencillos pasos:

1. **Entrar al directorio del proyecto:**
   ```bash
   cd aruna-next
   ```

2. **Instalar las dependencias de diseño e interactividad:**
   *(Ya preinstaladas por el asistente)*
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Ver el sitio en tu navegador:**
   Abre [http://localhost:3000](http://localhost:3000) para ver tu tienda en vivo.

---

## 🛠️ Cómo Administrar Tu Tienda (Sin Tocar Código)

### 1. Cambiar Teléfono, Redes y Textos Generales
Toda la configuración del sitio se centraliza en un único archivo: `src/config/site.ts`.

Abre el archivo [site.ts](file:///C:/Users/grupo/aruna-next/src/config/site.ts) y edita los campos que desees:
* **Número de WhatsApp:** Cambia `whatsapp: "+573123456789"` por tu número real (incluyendo el código del país sin espacios).
* **Instagram:** Cambia el enlace de tu cuenta oficial.
* **Preguntas Frecuentes (FAQ):** Agrega o modifica las respuestas del acordeón.
* **Testimonios:** Modifica las reseñas de tus clientes para que coincidan con la prueba social real.

### 2. Agregar, Editar o Eliminar Productos
Tus productos se listan en el archivo: `src/data/productos.ts`.

Para agregar un producto nuevo:
1. Sube las fotografías del producto (en formato cuadrado o vertical) a la carpeta `public/productos/`.
   * *Ejemplo: `public/productos/mochila-sususu-roja.jpg`*
2. Abre [productos.ts](file:///C:/Users/grupo/aruna-next/src/data/productos.ts).
3. Añade un objeto nuevo dentro del array `productos` siguiendo este formato:

```typescript
{
  id: "mochila-sususu-roja",
  nombre: "Mochila Sususu Roja",
  precio: 295000,
  precioAnterior: 340000, // Opcional, para mostrar descuento
  imagenes: ["/productos/mochila-sususu-roja.jpg"],
  description: "Tejida en un solo hilo con patrones que narran el viento...",
  colores: ["Rojo Fuego", "Crema Natural"],
  categoria: "mochilas",
  disponible: true, // Si es false, se mostrará como "Agotada"
  destacado: true   // Si es true, aparecerá en la página de inicio
}
```

---

## 🎨 Arquitectura y Sistema de Diseño Premium

### 🌿 Identidad Visual e Inspiración (La Guajira)
La interfaz visual de ARÜVIA incorpora íconos vectoriales SVG premium y minimalistas que representan la fauna y flora sagrada de La Guajira:
* **Colibrí:** Representa el viento y la vida. Animado con un sutil aleteo en la cabecera.
* **Flamenco Rosado:** Elegancia costera representativa de la laguna de flamencos.
* **Cardenal Guajiro:** Ave insignia con su característico copete de rojo intenso.
* **Cactus / Cardón:** Símbolo de resiliencia del desierto y tierra guajira.
* **Lirios & Peonías:** Detalles ornamentales y florales en encabezados y fondos.
* **Delfines:** Reflejan la frescura y la brisa del Mar Caribe que baña la península.

### 💎 Paleta de Colores Ancestral (Tailwind v4 `@theme`)
Los colores se definen e inyectan automáticamente en el compilador desde [globals.css](file:///C:/Users/grupo/aruna-next/src/app/globals.css):
* 🌸 `flamenco` (`#EC6F8E`) — Color primario suave de marca.
* 🍒 `cardenal` (`#C1272D`) — CTA principal y acentos intensos.
* 🌵 `cardon` (`#6E8156`) — Verde desierto secundario.
* 🌾 `arena` (`#F3E9D7`) — Fondo cálido principal (mucho espacio en blanco arena).
* 🪵 `arena-oscura` (`#E2CFA8`) — Bordes, tarjetas y secciones sutiles.
* 🌊 `caribe` (`#2A9D8F`) — Azul-verde delfín refrescante.
* 🪵 `carbon` (`#2B2420`) — Texto principal de alta legibilidad.

### ⚡ Estructura de Archivos del Proyecto
* `/src/app` — Rutas principales (Home, Catálogo, Producto Dinámico, Historia, Blog, Sitemap y Robots).
* `/src/components` — Elementos reutilizables (Header, Footer, ProductCard, ProductGrid, WhatsAppButton, CartDrawer, FaunaFloraIcons).
* `/src/config` — Archivo editable de configuración global (`site.ts`).
* `/src/data` — Catálogo de productos en array editable (`productos.ts`).
* `/src/context` — Manejo de estado del carrito de compras (`CartContext.tsx`).
* `/src/lib` — Utilidades matemáticas, SEO structured schema y WhatsApp deep-links.

---

## 📈 Optimización SEO de Primer Nivel

ARÜVIA cuenta con la infraestructura SEO más potente del mercado:
1. **Dynamic Metadata:** Metadatos completos (title, description, tags, locales canonicals) generados automáticamente en el servidor para cada producto y página.
2. **Schema.org Structured Data (JSON-LD):** Inyecta datos en formato Schema.org de tipo `Organization` y `Product` (con disponibilidad, marca y precios) para que Google muestre resultados enriquecidos con estrellas de calificación y precios en las búsquedas.
3. **Sitemap & Robots Dinámicos:** Genera dinámicamente `/sitemap.xml` y `/robots.txt` mapeando los productos del array para indexación veloz en Search Console.
4. **HTML Semántico:** Uso riguroso de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>` y `<footer>` con jerarquía exacta (un único `<h1>` por página).

---

## 📦 Instrucciones de Despliegue en Producción

El proyecto está 100% optimizado para la compilación estática ultrarrápida de Next.js (Turbopack) y está listo para desplegar en **Vercel** o **Netlify**:

### Desplegar en Vercel (Recomendado)
1. Instala la herramienta de línea de comandos de Vercel (`npm install -g vercel`) o vincula tu cuenta de GitHub.
2. Corre en tu terminal desde el directorio del proyecto:
   ```bash
   vercel
   ```
3. ¡Vercel detectará la configuración de Next.js App Router automáticamente y te dará tu enlace en vivo en segundos!

---

*Desarrollado y pulido minuciosamente por **Antigravity**.*
