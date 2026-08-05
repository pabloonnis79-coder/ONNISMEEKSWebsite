/**
 * Única fuente de verdad para la marca, las rutas y los datos de contacto.
 * Todo lo que alguien sin perfil técnico podría querer cambiar vive acá.
 */

export const site = {
  name: "ONNIS & MEEKS",
  shortName: "O&M",
  legalName: "Onnis & Meeks Studio",
  tagline: "Productora audiovisual",
  description:
    "Productora audiovisual. Dirigimos, filmamos y terminamos piezas para marcas que necesitan que su historia se vea bien contada.",
  /**
   * De aca salen las URL canonicas, el sitemap y las tarjetas para redes.
   * Si todavia no hay dominio propio, Vercel expone la URL de produccion y el
   * sitio se autoconfigura solo.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://onnismeeks.com"),
  locale: "es_AR",
  foundingYear: 2018,

  contact: {
    // TODO: reemplazar el correo por el real del estudio.
    email: "hola@onnismeeks.com",
    phone: "+54 9 11 6882 7421",
    /** Formato internacional sin signos, como lo pide wa.me */
    whatsapp: "5491168827421",
    whatsappMessage:
      "Hola, los encontré en la web y quiero consultarles por un proyecto audiovisual.",
    city: "Buenos Aires, Argentina",
  },

  social: {
    youtube:
      process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@ONNIS_MEEKS",
    // TODO: confirmar los perfiles reales del estudio.
    instagram: "https://instagram.com/onnismeeks",
    linkedin: "https://linkedin.com/company/onnismeeks",
    vimeo: "",
  },

  showreel: {
    youtubeId: process.env.NEXT_PUBLIC_SHOWREEL_YOUTUBE_ID ?? "",
    /** Loop corto y liviano para el fondo del hero. Opcional. */
    loopMp4: process.env.NEXT_PUBLIC_SHOWREEL_MP4 ?? "",
    poster: process.env.NEXT_PUBLIC_SHOWREEL_POSTER ?? "",
  },
} as const;

export type NavItem = { label: string; href: string };

/** Barra principal. Se mantiene corta a propósito: entra en una sola línea. */
export const primaryNav: NavItem[] = [
  { label: "Proyectos", href: "/proyectos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Clientes", href: "/clientes" },
  { label: "Estudio", href: "/estudio" },
];

/** Índice completo, dentro del menú desplegable. */
export const fullNav: NavItem[] = [
  ...primaryNav,
  { label: "Premios", href: "/premios" },
  { label: "Detrás de cámara", href: "/detras-de-camara" },
  { label: "Notas", href: "/notas" },
  { label: "Contacto", href: "/contacto" },
];

export type Service = {
  slug: string;
  name: string;
  summary: string;
  includes: string[];
};

export const services: Service[] = [
  {
    slug: "direccion",
    name: "Dirección",
    summary:
      "Definimos el punto de vista de la pieza y lo sostenemos desde el guion hasta el máster final.",
    includes: ["Guion y tratamiento", "Dirección de rodaje", "Casting", "Storyboard"],
  },
  {
    slug: "produccion",
    name: "Producción ejecutiva",
    summary:
      "Presupuesto, permisos, equipo y logística. El rodaje empieza el día que dijimos que iba a empezar.",
    includes: ["Presupuesto cerrado", "Locaciones", "Permisos", "Coordinación de equipo"],
  },
  {
    slug: "fotografia",
    name: "Dirección de fotografía",
    summary:
      "Cámara, luz y óptica elegidas por la historia, no por la ficha técnica del equipo.",
    includes: ["Cámara cine digital", "Iluminación", "Óptica", "Plan de rodaje"],
  },
  {
    slug: "aereas",
    name: "Aéreas y drone",
    summary:
      "Vuelos con piloto habilitado ANAC, para planos que ubican al espectador en dos segundos.",
    includes: ["Piloto habilitado", "Seguro de vuelo", "FPV", "Aéreas de locación"],
  },
  {
    slug: "post",
    name: "Post producción",
    summary:
      "Montaje, gráfica y armado de versiones. Una pieza madre y todos los cortes que pide cada canal.",
    includes: ["Montaje", "Motion graphics", "Versiones por formato", "Subtitulado"],
  },
  {
    slug: "color",
    name: "Color",
    summary:
      "Etalonaje en sala calibrada. La marca se ve igual en el cine, en el feed y en la tele del local.",
    includes: ["Etalonaje", "Look de campaña", "Entrega HDR y SDR", "Control de piel"],
  },
  {
    slug: "sonido",
    name: "Sonido y música",
    summary:
      "Registro directo, diseño sonoro y música original o licenciada, mezclada para cada plataforma.",
    includes: ["Sonido directo", "Diseño sonoro", "Música original", "Mezcla y máster"],
  },
  {
    slug: "fotografia-fija",
    name: "Fotografía de campaña",
    summary:
      "Se filma una vez y se aprovecha todo. La gráfica sale del mismo rodaje, con la misma dirección de arte.",
    includes: ["Producto", "Retrato", "Making of", "Banco de imágenes"],
  },
];

export const capabilities = [
  "Publicidad",
  "Branded content",
  "Documental de marca",
  "Institucional",
  "Contenido para redes",
  "Cobertura de evento",
  "Video musical",
  "Fotografía",
];
