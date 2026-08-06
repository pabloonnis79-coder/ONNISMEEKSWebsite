import "server-only";

import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Clave donde vive el video de fondo de cada seccion. */
export const CLAVE_VIDEOS_SECCION = "section_videos";

export type VideosDeSeccion = Record<string, string>;

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

export async function getSectionVideos(): Promise<VideosDeSeccion> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", CLAVE_VIDEOS_SECCION)
    .maybeSingle();

  if (error) {
    // La tabla puede no existir todavia si no se corrio la migracion. No es
    // motivo para tirar abajo la portada: se cae al video por defecto.
    if (error.code !== "PGRST205") console.error("[db] getSectionVideos:", error.message);
    return {};
  }

  const value = (data as any)?.value;
  if (!value || typeof value !== "object") return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v === "string" && v.length > 0)
      .map(([k, v]) => [k, v as string]),
  );
}
