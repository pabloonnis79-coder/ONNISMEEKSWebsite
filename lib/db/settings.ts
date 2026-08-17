import "server-only";

import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";
import { getVideos, isYouTubeConfigured } from "@/lib/youtube/api";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Clave donde vive el video de fondo de cada seccion. */
export const CLAVE_VIDEOS_SECCION = "section_videos";
/** Clave del MP4 propio de cada seccion, que tiene prioridad sobre YouTube. */
export const CLAVE_MP4_SECCION = "section_mp4";
/** Clave donde viven las autoridades del estudio. */
export const CLAVE_AUTORIDADES = "authorities";
/** Clave de las galerias de fotografia, agrupadas por categoria. */
export const CLAVE_FOTOGRAFIA = "photo_galleries";
/** Clave de los logos de marcas del carrusel. */
export const CLAVE_MARCAS = "brand_logos";
/** Clave del tamano al que se dibujan esos logos. */
export const CLAVE_MARCAS_ESCALA = "brand_logos_scale";
/** Clave de los reels verticales. */
export const CLAVE_REELS = "reels";

export type Reel = {
  youtubeId: string;
  titulo: string;
  cliente: string;
  /** Segundos. No se carga a mano: lo trae getReelsConDuracion desde YouTube. */
  duracion?: number;
};

/** Cuantos reels admite la seccion. */
export const MAX_REELS = 8;

export type GaleriaFoto = { titulo: string; fotos: string[] };
export type Marca = { nombre: string; logo: string; sitio: string };

/** Cuantas categorias de fotografia admite el panel. */
export const MAX_GALERIAS = 4;
/** Cuantas marcas admite el carrusel. */
export const MAX_MARCAS = 12;

/**
 * Tamanos a los que se puede dibujar el carrusel de marcas. Son multiplicadores
 * sobre la altura base del logo, no valores absolutos: asi el numero significa
 * lo mismo en el celular y en el escritorio.
 */
export const ESCALAS_MARCAS = [0.25, 0.5, 1, 1.25, 1.5, 2] as const;
export const ESCALA_MARCAS_POR_DEFECTO = 1;

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
  /** Solo para armar la firma de correo. No se publica en el sitio. */
  email: string;
};

// extraerYoutubeId vive en lib/utils: los formularios del panel lo usan para la
// vista previa en vivo y este archivo es server-only, no lo pueden importar.


/**
 * Lee una clave de configuracion. Si la tabla todavia no existe porque no se
 * corrio la migracion, devuelve null en vez de tirar abajo la pagina.
 */
export async function leerAjuste(key: string): Promise<unknown> {
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
  return leerMapaDeTextos(CLAVE_VIDEOS_SECCION);
}

/**
 * MP4 propio de cada seccion, subido desde el panel.
 *
 * Cuando hay uno cargado le gana al video de YouTube: es un archivo servido
 * directo, sin reproductor de terceros encima, asi que no hay controles que
 * esconder ni script que esperar. Para un fondo en bucle es lo mas limpio que
 * existe.
 */
export async function getSectionMp4(): Promise<VideosDeSeccion> {
  return leerMapaDeTextos(CLAVE_MP4_SECCION);
}

/** Lee un ajuste que guarda pares seccion/texto y descarta lo que no lo sea. */
async function leerMapaDeTextos(clave: string): Promise<VideosDeSeccion> {
  const value = await leerAjuste(clave);
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

/**
 * Tamano elegido para el carrusel. Si lo guardado no es uno de los valores
 * previstos se vuelve al normal, en vez de dibujar cualquier cosa.
 */
export async function getBrandScale(): Promise<number> {
  const value = await leerAjuste(CLAVE_MARCAS_ESCALA);
  const numero = Number(value);

  return (ESCALAS_MARCAS as readonly number[]).includes(numero)
    ? numero
    : ESCALA_MARCAS_POR_DEFECTO;
}

export async function getReels(): Promise<Reel[]> {
  const value = await leerAjuste(CLAVE_REELS);
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const r = item as Partial<Reel>;
      return {
        youtubeId: String(r?.youtubeId ?? "").trim(),
        titulo: String(r?.titulo ?? "").trim(),
        cliente: String(r?.cliente ?? "").trim(),
      };
    })
    .filter((r) => r.youtubeId);
}

/**
 * Los mismos reels, con la duracion que informa YouTube.
 *
 * La duracion no se guarda en el panel a proposito: es un dato del video, no
 * una decision editorial, y pedirsela a quien carga el reel es pedirle que
 * copie a mano algo que ya existe y que ademas cambia si vuelve a subir la
 * pieza.
 *
 * Es una sola llamada para los ocho ids. Si falla o si no hay clave, los reels
 * salen igual sin el dato: una insignia de menos no justifica una portada
 * rota.
 */
export async function getReelsConDuracion(): Promise<Reel[]> {
  const reels = await getReels();
  if (reels.length === 0 || !isYouTubeConfigured()) return reels;

  try {
    // Un dia de cache: la duracion de un video no cambia, y sin cache esta
    // sola peticion obligaria a la portada a renderizarse en cada visita.
    const videos = await getVideos(reels.map((r) => r.youtubeId), 86400);
    const porId = new Map(videos.map((v) => [v.id, v.durationSeconds ?? undefined]));

    return reels.map((r) => ({ ...r, duracion: porId.get(r.youtubeId) }));
  } catch (error) {
    console.error("[reels] no se pudo leer la duracion:", error);
    return reels;
  }
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
        email: String(a?.email ?? "").trim(),
      };
    })
    // Sin nombre la ficha no dice nada, asi que no se muestra.
    .filter((a) => a.nombre || a.apellido);
}
