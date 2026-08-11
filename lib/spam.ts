import { site } from "@/lib/site";

/**
 * Filtro de spam del formulario de contacto.
 *
 * Nada de esto rechaza el mensaje: lo marca. Un filtro que descarta se come
 * tarde o temprano una consulta real y nadie se entera nunca. Este guarda todo
 * y solo decide dos cosas: si dispara el aviso por correo y en que pestaña del
 * panel aparece.
 *
 * Por eso el umbral es deliberadamente alto y ninguna senal alcanza sola para
 * marcar spam, salvo las que no puede producir una persona.
 */

/** Puntaje a partir del cual el mensaje va a la pestaña de spam. */
const UMBRAL = 4;

/** Segundos minimos entre que carga el formulario y se envia. */
const SEGUNDOS_MINIMOS = 4;

/**
 * Muletillas del spam comercial en ingles. Van juntas en los mensajes que
 * llegaron: ofertas de SEO, de dominios y de desarrollo web.
 */
const FRASES = [
  "dear sir",
  "dear madam",
  "dear owner",
  "to whom it may concern",
  "best regards",
  "kindly",
  "seo services",
  "search engine ranking",
  "first page of google",
  "web development services",
  "increase your traffic",
  "domain name",
  "trademark",
];

export type Veredicto = {
  esSpam: boolean;
  puntaje: number;
  motivos: string[];
};

/**
 * El truco de los puntos en Gmail: juanperez@gmail.com y j.u.a.n.p.e.r.e.z@
 * son la misma casilla. Sirve para mandar el mismo formulario muchas veces
 * como si fueran personas distintas, que es exactamente lo que pasó acá.
 */
function gmailConPuntos(email: string): boolean {
  const [local, dominio] = email.toLowerCase().split("@");
  if (!dominio?.startsWith("gmail.")) return false;
  return (local.match(/\./g)?.length ?? 0) >= 3;
}

/**
 * Dominios que imitan al propio para dar confianza: search-onnismeeks.com,
 * onnismeeks-registry.com y demás. Ninguna persona real escribe desde ahí.
 */
function imitaElDominio(email: string): boolean {
  const propio = site.url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const marca = propio.split(".")[0];
  const dominio = email.toLowerCase().split("@")[1] ?? "";

  return dominio.includes(marca) && dominio !== propio;
}

export type EntradaSpam = {
  name: string;
  email: string;
  company?: string | null;
  message: string;
  /** Milisegundos de cuando se cargó el formulario, según el navegador. */
  cargadoEn?: number | null;
};

export function evaluarSpam(entrada: EntradaSpam): Veredicto {
  const motivos: string[] = [];
  let puntaje = 0;

  const texto = `${entrada.name} ${entrada.company ?? ""} ${entrada.message}`.toLowerCase();

  // Un bot completa y envía de una. Una persona tarda en escribir.
  const transcurrido = entrada.cargadoEn ? (Date.now() - entrada.cargadoEn) / 1000 : null;
  if (transcurrido === null) {
    puntaje += 2;
    motivos.push("sin marca de tiempo");
  } else if (transcurrido < SEGUNDOS_MINIMOS) {
    puntaje += 3;
    motivos.push(`enviado en ${transcurrido.toFixed(1)} segundos`);
  }

  // Enlaces. Uno solo puede ser un brief legítimo en Drive, así que suma poco.
  const enlaces = entrada.message.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (enlaces >= 3) {
    puntaje += 3;
    motivos.push(`${enlaces} enlaces`);
  } else if (enlaces >= 1) {
    puntaje += 2;
    motivos.push("tiene enlaces");
  }

  const frases = FRASES.filter((f) => texto.includes(f));
  if (frases.length > 0) {
    puntaje += frases.length >= 2 ? 3 : 2;
    motivos.push(`frases de venta: ${frases.slice(0, 3).join(", ")}`);
  }

  if (gmailConPuntos(entrada.email)) {
    puntaje += 3;
    motivos.push("gmail con puntos de relleno");
  }

  if (imitaElDominio(entrada.email)) {
    puntaje += 4;
    motivos.push("dominio que imita al nuestro");
  }

  // Mensaje sin una sola vocal repetida ni espacios largos: teclado aporreado.
  const palabras = entrada.message.trim().split(/\s+/);
  if (palabras.length <= 2 && entrada.message.length > 30) {
    puntaje += 2;
    motivos.push("una sola palabra larga");
  }

  return { esSpam: puntaje >= UMBRAL, puntaje, motivos };
}
