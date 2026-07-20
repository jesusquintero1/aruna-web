/**
 * CONFIGURACIÓN GLOBAL DE ARÜVIA
 * 
 * Centraliza toda la información de la tienda.
 * El dueño puede modificar este archivo para cambiar números, enlaces de redes sociales,
 * SEO, textos del footer y variables generales sin tocar código.
 */

export const siteConfig = {
  name: "ARÜVIA",
  tagline: "Mochilas Wayuu Auténticas · Tejidas con el Alma de La Guajira",
  description: "Boutique premium de mochilas Wayuu 100% tejidas a mano en La Guajira, Colombia. Comercio justo, piezas únicas con alma y tradición ancestral.",
  url: "https://aruna-wayuu.netlify.app", // Dominio de producción (Netlify)
  
  // CONFIGURACIÓN DE CONTACTO Y VENTAS
  contact: {
    // IMPORTANTE: Cambiar este número por el número de WhatsApp real con código de país.
    // Ejemplo: "+573123456789" para Colombia. Sin espacios, sin guiones.
    whatsapp: "+573123456789", 
    email: "hola@aruvia.com",
    address: "Maicao, La Guajira, Colombia",
    instagram: "https://instagram.com/aruvia.guajira", // Cuenta de instagram real o placeholder
    facebook: "https://facebook.com/aruvia.guajira",
  },

  // IDENTIDAD LEGAL (para páginas legales y facturación).
  // IMPORTANTE: reemplazar los placeholders por los datos reales del negocio
  // antes de salir a producción, y revisar los textos legales con un abogado.
  legal: {
    razonSocial: "[RAZÓN SOCIAL]",       // p. ej. "ARÜVIA S.A.S." o nombre del comerciante
    nit: "[NIT / CÉDULA]",
    domicilio: "Maicao, La Guajira, Colombia",
    ciudad: "Maicao, La Guajira",
    vigenciaDesde: "2026",
  },

  // CONFIGURACIÓN DE ENVÍOS Y GARANTÍAS
  shipping: {
    national: "Envíos gratis a toda Colombia",
    international: "Envíos internacionales express via DHL",
    guarantee: "Garantía de autenticidad de por vida",
  },

  // TEXTOS DE HISTORIA Y CULTURA
  culture: {
    title: "El Alma de La Guajira en Cada Tejido",
    text: "En el extremo norte de Colombia, donde el desierto abraza al Mar Caribe, nace el arte del tejido Wayuu. Para nuestra comunidad, tejer no es solo un oficio; es una forma de narrar el universo, un lenguaje plasmado en figuras geométricas llamadas Kanas. Cada mochila ARÜVIA es una pieza única tejida a mano por artesanas locales en un proceso que lleva entre 20 y 30 días, preservando técnicas centenarias y garantizando un comercio justo que empodera a sus creadoras.",
  },

  // PREGUNTAS FRECUENTES (FAQ)
  faqs: [
    {
      question: "¿Las mochilas son realmente tejidas a mano?",
      answer: "Sí, absolutamente. Cada mochila de ARÜVIA es 100% tejida a mano por maestras artesanas Wayuu de rancherías en La Guajira, utilizando técnicas ancestrales transmitidas de generación en generación. No hay dos mochilas idénticas."
    },
    {
      question: "¿Cómo funciona el envío y cuánto tarda?",
      answer: "Ofrecemos envío gratuito a toda Colombia. El envío suele tardar entre 2 y 5 días hábiles dependiendo de tu ubicación. Para envíos internacionales, trabajamos con DHL Express y el tiempo de entrega es de 4 a 8 días hábiles."
    },
    {
      question: "¿Cómo cuido mi mochila Wayuu?",
      answer: "Nuestras mochilas de algodón premium son muy resistentes. Se pueden lavar a mano o en lavadora en ciclo delicado dentro de una bolsa protectora, usando agua fría y jabón suave. Se recomienda secar a la sombra en una superficie plana."
    },
    {
      question: "¿Qué significa el patrón geométrico (Kana) de mi mochila?",
      answer: "Los Kanas son las figuras geométricas que decoran el cuerpo de la mochila. Representan elementos de la naturaleza (como constelaciones, caparazones de tortugas, huellas de animales o plantas) y expresan el linaje, la sabiduría y la cosmovisión de la tejedora."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "En Colombia aceptamos transferencias bancarias (Bancolombia, Nequi, Daviplata), tarjetas de crédito y pago contra entrega (según cobertura). Para compras internacionales, aceptamos PayPal y transferencias internacionales."
    }
  ],

  // TESTIMONIOS (PRUEBA SOCIAL)
  // VACÍO a propósito: no inventamos reseñas (Ley 1480 / publicidad engañosa).
  // Cuando tengas reseñas REALES de clientes, agrégalas aquí y la sección
  // "Historias que enamoran" del inicio reaparece automáticamente. Formato:
  //   { name: "Nombre", location: "Ciudad, País", text: "Su reseña…", stars: 5 }
  testimonials: [] as { name: string; location: string; text: string; stars: number }[],

  // PALABRAS CLAVE PARA SEO
  seoKeywords: [
    "mochilas wayuu",
    "mochila wayuu original",
    "artesanías wayuu",
    "mochila wayuu hecha a mano",
    "artesanías La Guajira",
    "comprar mochila wayuu Colombia",
    "mochilas de La Guajira",
    "comercio justo Wayuu",
    "bolsos artesanales colombianos"
  ]
};
