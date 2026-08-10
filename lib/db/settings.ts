import "server-only";

import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Clave donde vive el video de fondo de cada seccion. */
export const CLAVE_VIDEOS_SECCION = "section_videos";
/** Clave donde viven las autoridades del estudio. */
export const CLAVE_AUTORIDADES = "authorities";
/** Clave de las galerias de fotografia, agrupadas por categoria. */
export const CLAVE_FOTOGRAFIA = "photo_galleries";
/** Clave de los logos de marcas del carrusel. */
export const CLAVE_MARCAS = "brand_logos";

export type GaleriaFoto = { titulo: string; fotos: string[] };
export type Marca = { nombre: string; logo: string; sitio: string };

/** Cuantas categorias de fotografia admite el panel. */
export const MAX_GALERIAS = 4;
/** Cuantas marcas admite el carrusel. */
export const MAX_MARCAS = 12;

/**
 * Convierte un enlace de Google Drive en una direccion que sirva dentro de una
 * etiqueta de imagen.
 *
 * El enlace que da el boton "Compartir" apunta al visor de Drive, que devuelve
 * una pagina HTML, no la imagen. Hay que quedarse con el identificador y pedir
 * el archivo por el CDN de Google, que es el unico camino estable: la vieja
 * direccion `drive.google.com/uc` redirige y a veces contesta con una pantalla
 * de aviso en vez del archivo.
 *
 * Ojo: el archivo tiene que estar compartido como "cualquiera con el enlace".
 */
export function normalizarImagen(entrada: string): string {
  const texto = entrada.trim();
  if (!texto) return "";

  if (/drive\.google\.com|docs\.google\.com/.test(texto)) {
    const id =
      /\/file\/d\/([A-Za-z0-9_-]+)/.exec(texto)?.[1] ??
      /[?&]id=([A-Za-z0-9_-]+)/.exec(texto)?.[1] ??
      /\/d\/([A-Za-z0-9_-]+)/.exec(texto)?.[1];

    if (id) return `https://lh3.googleusercontent.com/d/${id}`;
  }

  return texto;
}

export type VideosDeSeccion = Record<string, string>;

export type Autoridad = {
  foto: string;
  nombre: string;
  apellido: string;
  cargo: string;
};

/**
 * Extrae el id de un enlace de YouTube. Acepta lo que se copia del navegador:
 * youtu.be, watch?v=, shorts, embed, o directamente el id pelado.
 */
export function extraerYoutubeId(entrada: string): string | null {
  const texto = entrada.trim();
  if (!texto) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(texto)) return texto;

  const m = /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/.exec(texto);
  return m ? m[1] : null;
}

/**
 * Lee una clave de configuracion. Si la tabla todavia no existe porque no se
 * corrio la migracion, devuelve null en vez de tirar abajo la pagina.
 */
async function leerAjuste(key: string): Promise<unknown> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    if (error.code !== "PGRST205") console.error(`[db] ajuste ${key}:`, error.message);
    return null;
  }

  return (data as any)?.value ?? null;
}

export async function getSectionVideos(): Promise<VideosDeSeccion> {
  const value = await leerAjuste(CLAVE_VIDEOS_SECCION);
  if (!value || typeof value !== "object") return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v === "string" && v.length > 0)
      .map(([k, v]) => [k, v as string]),
  );
}

export async function getPhotoGalleries(): Promise<GaleriaFoto[]> {
  const value = await leerAjuste(CLAVE_FOTOGRAFIA);
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const g = item as Partial<GaleriaFoto>;
      return {
        titulo: String(g?.titulo ?? "").trim(),
        fotos: Array.isArray(g?.fotos)
          ? g.fotos.map((f) => normalizarImagen(String(f))).filter(Boolean)
          : [],
      };
    })
    .filter((g) => g.titulo && g.fotos.length > 0);
}

export async function getBrandLogos(): Promise<Marca[]> {
  const value = await leerAjuste(CLAVE_MARCAS);
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const m = item as Partial<Marca>;
      return {
        nombre: String(m?.nombre ?? "").trim(),
        logo: normalizarImagen(String(m?.logo ?? "")),
        sitio: String(m?.sitio ?? "").trim(),
      };
    })
    .filter((m) => m.nombre || m.logo);
}

export async function getAuthorities(): Promise<Autoridad[]> {
  const value = await leerAjuste(CLAVE_AUTORIDADES);
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const a = item as Partial<Autoridad>;
      return {
        foto: String(a?.foto ?? "").trim(),
        nombre: String(a?.nombre ?? "").trim(),
        apellido: String(a?.apellido ?? "").trim(),
        cargo: String(a?.cargo ?? "").trim(),
      };
    })
    // Sin nombre la ficha no dice nada, asi que no se muestra.
    .filter((a) => a.nombre || a.apellido);
}
