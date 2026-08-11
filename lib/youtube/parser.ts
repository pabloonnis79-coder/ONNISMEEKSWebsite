import type { Credit, ExtraVideo, GalleryItem } from "@/lib/types";
import { slugify, uniq } from "@/lib/utils";

/**
 * Parses the structured block that lives inside a YouTube video description.
 * This is the CMS: whatever is written there becomes the project page.
 *
 *   CLIENTE: Nike
 *   PROYECTO: Air Max 2027
 *   ANIO: 2027
 *   FECHA: 15/08/2027
 *   SERVICIOS:
 *   Produccion audiovisual
 *   Direccion
 *   ...
 *
 * A field ends where the next known key starts, so multi-line blocks work
 * without any terminator. Keys are accent and case insensitive.
 */

export type ParsedDescription = {
  clientName: string | null;
  projectName: string | null;
  year: number | null;
  projectDate: string | null;
  services: string[];
  category: string | null;
  location: string | null;
  story: string | null;
  results: string | null;
  tags: string[];
  coverUrl: string | null;
  featured: boolean;
  sortOrder: number | null;
  credits: Credit[];
  gallery: GalleryItem[];
  makingOf: ExtraVideo[];
  /** True when at least one structured key was found. */
  structured: boolean;
};

type FieldKey =
  | "cliente"
  | "proyecto"
  | "anio"
  | "fecha"
  | "servicios"
  | "categoria"
  | "ubicacion"
  | "descripcion"
  | "resultados"
  | "tags"
  | "portada"
  | "destacado"
  | "orden"
  | "creditos"
  | "galeria"
  | "makingof";

const KEY_ALIASES: Record<string, FieldKey> = {
  cliente: "cliente",
  client: "cliente",
  marca: "cliente",
  proyecto: "proyecto",
  project: "proyecto",
  titulo: "proyecto",
  ano: "anio",
  anio: "anio",
  year: "anio",
  fecha: "fecha",
  date: "fecha",
  servicios: "servicios",
  services: "servicios",
  categoria: "categoria",
  category: "categoria",
  rubro: "categoria",
  ubicacion: "ubicacion",
  location: "ubicacion",
  locacion: "ubicacion",
  descripcion: "descripcion",
  description: "descripcion",
  historia: "descripcion",
  resultados: "resultados",
  results: "resultados",
  resultado: "resultados",
  tags: "tags",
  etiquetas: "tags",
  portada: "portada",
  cover: "portada",
  destacado: "destacado",
  featured: "destacado",
  orden: "orden",
  order: "orden",
  creditos: "creditos",
  credits: "creditos",
  equipo: "creditos",
  galeria: "galeria",
  gallery: "galeria",
  makingof: "makingof",
  "making of": "makingof",
  detrasdecamara: "makingof",
  bts: "makingof",
};

/** Lowercase, accent-stripped, punctuation-free key lookup. */
function normalizeKey(raw: string): FieldKey | null {
  const key = raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim();
  return KEY_ALIASES[key] ?? KEY_ALIASES[key.replace(/ /g, "")] ?? null;
}

const KEY_LINE = /^\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]{2,24})\s*:\s*(.*)$/;

/** Lines that mark the end of editorial content and the start of channel boilerplate. */
const NOISE_LINE =
  /^(\s*[-=_*~]{3,}\s*|.*\b(suscrib\w+|subscribe|seguinos|seguime|follow us|instagram\.com|facebook\.com|linkedin\.com|tiktok\.com|wa\.me|whatsapp)\b.*)$/i;

function splitList(value: string): string[] {
  return uniq(
    value
      .split(/[\n,;|]/)
      .map((s) => s.replace(/^[-*•\s]+/, "").trim())
      .filter((s) => s.length > 0 && s.length < 60),
  );
}

function parseYear(value: string): number | null {
  const m = /\b(19|20)\d{2}\b/.exec(value);
  if (!m) return null;
  const year = Number(m[0]);
  return year >= 1980 && year <= 2100 ? year : null;
}

/** Accepts DD/MM/YYYY, DD-MM-YYYY and YYYY-MM-DD. Returns an ISO date. */
function parseDate(value: string): string | null {
  const dmy = /\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\b/.exec(value);
  if (dmy) {
    const [, d, m, y] = dmy;
    const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return Number.isNaN(new Date(iso).getTime()) ? null : iso;
  }
  const ymd = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/.exec(value);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function parseBool(value: string): boolean {
  return /^(si|sí|s|yes|y|true|1|x)\b/i.test(value.trim());
}

/** "Direccion: Ana Ferreyra" or "Direccion - Ana Ferreyra" per line. */
function parseCredits(block: string): Credit[] {
  return block
    .split("\n")
    .map((line) => line.replace(/^[-*•\s]+/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const m = /^(.+?)\s*[:\-–]\s*(.+)$/.exec(line);
      if (!m) return null;
      return { role: m[1].trim(), name: m[2].trim() } satisfies Credit;
    })
    .filter((c): c is Credit => c !== null);
}

function parseGallery(block: string): GalleryItem[] {
  return block
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s))
    .map((url) => ({ url, alt: "" }));
}

const YT_ID = /(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/;

function parseVideoList(block: string): ExtraVideo[] {
  return block
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map<ExtraVideo | null>((line) => {
      const m = YT_ID.exec(line);
      const label =
        line.replace(/https?:\/\/\S+/g, "").replace(/[:\-–|]\s*$/, "").trim() ||
        "Making of";
      if (m) return { youtubeId: m[1], label };
      if (/^https?:\/\//.test(line)) return { url: line, label };
      return null;
    })
    .filter((v): v is ExtraVideo => v !== null);
}

/** Drops trailing channel boilerplate from a free-text block. */
function cleanProse(block: string): string | null {
  const lines: string[] = [];
  for (const line of block.split("\n")) {
    if (NOISE_LINE.test(line)) break;
    lines.push(line);
  }
  const text = lines.join("\n").trim();
  return text.length > 0 ? text : null;
}

export function parseDescription(description: string): ParsedDescription {
  const raw = (description ?? "").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");

  const blocks = new Map<FieldKey, string[]>();
  let current: FieldKey | null = null;
  let sawKey = false;

  for (const line of lines) {
    const m = KEY_LINE.exec(line);
    const key = m ? normalizeKey(m[1]) : null;

    if (key) {
      sawKey = true;
      current = key;
      const inline = m![2].trim();
      blocks.set(key, inline ? [inline] : []);
      continue;
    }

    /*
      El machete del canal va al final de toda descripcion: la raya divisoria,
      el "seguinos", los enlaces a las redes. Ahi se corta la acumulacion, si no
      esas lineas se le pegan al ultimo campo que haya quedado abierto. Con la
      plantilla ese campo es TAGS, y "Seguinos en Instagram" terminaba publicado
      como etiqueta del proyecto.

      No se corta el recorrido entero porque la clave siguiente vuelve a abrir
      un campo: alguien puede usar una raya para separar dos bloques.
    */
    if (NOISE_LINE.test(line)) {
      current = null;
      continue;
    }

    if (current) blocks.get(current)!.push(line);
  }

  const get = (key: FieldKey): string =>
    (blocks.get(key) ?? []).join("\n").replace(/^\n+|\n+$/g, "").trim();

  const clientName = get("cliente") || null;
  const projectName = get("proyecto") || null;
  const dateValue = get("fecha");
  const projectDate = dateValue ? parseDate(dateValue) : null;
  const yearValue = get("anio");

  const year =
    (yearValue ? parseYear(yearValue) : null) ??
    (projectDate ? Number(projectDate.slice(0, 4)) : null);

  const story = sawKey ? cleanProse(get("descripcion")) : cleanProse(raw);
  const portada = get("portada");

  return {
    clientName,
    projectName,
    year,
    projectDate,
    services: splitList(get("servicios")),
    category: get("categoria") || null,
    location: get("ubicacion") || null,
    story,
    results: cleanProse(get("resultados")),
    tags: splitList(get("tags")),
    coverUrl: /^https?:\/\//.test(portada) ? portada : null,
    featured: parseBool(get("destacado")),
    sortOrder: get("orden") ? Number.parseInt(get("orden"), 10) || null : null,
    credits: parseCredits(get("creditos")),
    gallery: parseGallery(get("galeria")),
    makingOf: parseVideoList(get("makingof")),
    structured: sawKey,
  };
}

/**
 * Project slug. Client plus project name reads best in a URL and stays stable
 * even if the YouTube title changes later.
 */
export function buildSlug(
  parsed: ParsedDescription,
  fallbackTitle: string,
  youtubeId: string,
): string {
  const parts = [parsed.clientName, parsed.projectName].filter(Boolean) as string[];
  const base = parts.length > 0 ? parts.join(" ") : fallbackTitle;
  const slug = slugify(base);
  return slug.length > 2 ? slug : `proyecto-${youtubeId.toLowerCase()}`;
}
