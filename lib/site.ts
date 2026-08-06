/**
 * Única fuente de verdad para la marca, las rutas y los datos de contacto.
 * Todo lo que alguien sin perfil técnico podría querer cambiar vive acá.
 */

/**
 * De acá salen las URL canónicas, el sitemap, el robots y las tarjetas para
 * redes. Es el dato que más caro sale equivocar: un sitemap apuntando a
 * localhost deja el sitio sin indexar.
 *
 * Por eso, si la variable quedó con una dirección local pero estamos corriendo
 * en Vercel, gana la URL de producción. En desarrollo localhost sigue mandando,
 * que es lo correcto.
 */
function resolveSiteUrl(): string {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const esLocal = explicita ? /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(explicita) : false;

  if (explicita && !(esLocal && vercel)) return explicita.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "https://onnismeeks.com";
}

export const site = {
  name: "ONNIS & MEEKS",
  shortName: "O&M",
  legalName: "Onnis & Meeks Studio",
  tagline: "Productora audiovisual",
  description:
    "Productora audiovisual. Dirigimos, filmamos y terminamos piezas para marcas que necesitan que su historia se vea bien contada.",
  url: resolveSiteUrl(),
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
  /**
   * Como se muestra la seccion. "fotos" arma una grilla de imagenes en vez de
   * un video de fondo: la fotografia no se muestra en movimiento.
   */
  media: "video" | "fotos";
};

/**
 * Cinco secciones, cada una con su panel en la portada y su propia página.
 * TODO: confirmar con el estudio que estos son los cinco servicios reales y
 * ajustar nombres y textos. Los de abajo son una propuesta, no un dato.
 */
export const services: Service[] = [
  {
    slug: "produccion-audiovisual",
    name: "Producción audiovisual",
    summary:
      "Dirección, producción ejecutiva y rodaje. Definimos el punto de vista de la pieza y lo sostenemos desde el guion hasta el máster final.",
    includes: [
      "Guion y tratamiento",
      "Dirección de rodaje",
      "Producción ejecutiva",
      "Cámara cine digital",
      "Aéreas con piloto habilitado",
      "Sonido directo",
    ],
    media: "video",
  },
  {
    slug: "produccion-fotografica",
    name: "Producción fotográfica",
    summary:
      "Se filma una vez y se aprovecha todo. La gráfica sale del mismo rodaje, con la misma dirección de arte.",
    includes: ["Producto", "Retrato", "Campaña", "Making of", "Banco de imágenes"],
    media: "fotos",
  },
  {
    slug: "color",
    name: "Color grading",
    summary:
      "Etalonaje en sala calibrada. La marca se ve igual en el cine, en el feed y en la tele del local.",
    includes: ["Etalonaje", "Look de campaña", "Entrega HDR y SDR", "Control de piel"],
    media: "video",
  },
  {
    slug: "animacion-vfx",
    name: "Animación y VFX",
    summary:
      "Motion graphics, composición y efectos. Lo que no se puede filmar, se construye.",
    includes: ["Motion graphics", "Composición", "Limpieza de plano", "Títulos y placas"],
    media: "video",
  },
  {
    slug: "contenido",
    name: "Contenido para marcas",
    summary:
      "Piezas pensadas para publicar seguido. Un rodaje que rinde durante meses en todos los canales.",
    includes: [
      "Series para redes",
      "Versiones por formato",
      "Subtitulado",
      "Calendario de publicación",
    ],
    media: "video",
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
