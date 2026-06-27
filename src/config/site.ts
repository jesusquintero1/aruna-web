/**
 * CONFIGURACIÓN GLOBAL DE ARUNA
 * 
 * Centraliza toda la información de la tienda.
 * El dueño puede modificar este archivo para cambiar números, enlaces de redes sociales,
 * SEO, textos del footer y variables generales sin tocar código.
 */

export const siteConfig = {
  name: "ARÜNA",
  tagline: "Mochilas Wayuu Auténticas · Tejidas con el Alma de La Guajira",
  description: "Boutique premium de mochilas Wayuu 100% tejidas a mano en La Guajira, Colombia. Comercio justo, piezas únicas con alma y tradición ancestral.",
  url: "https://aruna-wayuu.vercel.app", // Cambiar al dominio real una vez desplegado
  
  // CONFIGURACIÓN DE CONTACTO Y VENTAS
  contact: {
    // IMPORTANTE: Cambiar este número por el número de WhatsApp real con código de país.
    // Ejemplo: "+573123456789" para Colombia. Sin espacios, sin guiones.
    whatsapp: "+573123456789", 
    email: "hola@arunawayuu.com",
    address: "Maicao, La Guajira, Colombia",
    instagram: "https://instagram.com/aruna.guajira", // Cuenta de instagram real o placeholder
    facebook: "https://facebook.com/aruna.guajira",
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
    text: "En el extremo norte de Colombia, donde el desierto abraza al Mar Caribe, nace el arte del tejido Wayuu. Para nuestra comunidad, tejer no es solo un oficio; es una forma de narrar el universo, un lenguaje plasmado en figuras geométricas llamadas Kanas. Cada mochila ARÜNA es una pieza única tejida a mano por artesanas locales en un proceso que lleva entre 20 y 30 días, preservando técnicas centenarias y garantizando un comercio justo que empodera a sus creadoras.",
  },

  // PREGUNTAS FRECUENTES (FAQ)
  faqs: [
    {
      question: "¿Las mochilas son realmente tejidas a mano?",
      answer: "Sí, absolutamente. Cada mochila de ARÜNA es 100% tejida a mano por maestras artesanas Wayuu de rancherías en La Guajira, utilizando técnicas ancestrales transmitidas de generación en generación. No hay dos mochilas idénticas."
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
  testimonials: [
    {
      name: "Mariana Restrepo",
      location: "Medellín, Colombia",
      text: "La mochila es simplemente espectacular. Los colores son vibrantes y los acabados son perfectos. Se nota el amor y el trabajo en cada detalle. Definitivamente volveré a comprar.",
      stars: 5,
    },
    {
      name: "Jean-Pierre Laurent",
      location: "París, Francia",
      text: "Compré una mochila para mi esposa y está encantada. Llegó a Francia en solo 5 días en un empaque hermoso. El servicio al cliente por WhatsApp fue sumamente atento y profesional. Un pedazo de arte real.",
      stars: 5,
    },
    {
      name: "Camila Echeverry",
      location: "Bogotá, Colombia",
      text: "Me encanta el enfoque de comercio justo de ARÜNA. Recibir una mochila única, saber quién la tejió y saber que se apoya a la comunidad indígena de La Guajira hace que la compra sea sumamente especial.",
      stars: 5,
    }
  ],

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
