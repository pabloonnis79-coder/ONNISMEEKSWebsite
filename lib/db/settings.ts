import "server-only";

import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Clave donde vive el video de fondo de cada seccion. */
export const CLAVE_VIDEOS_SECCION = "section_videos";
/** Clave donde viven las autoridades del estudio. */
export const CLAVE_AUTORIDADES = "authorities";

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
