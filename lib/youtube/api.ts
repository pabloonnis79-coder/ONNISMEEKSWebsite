import { parseIsoDuration } from "@/lib/utils";

const API = "https://www.googleapis.com/youtube/v3";

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string | null;
  durationSeconds: number | null;
  tags: string[];
};

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Falta YOUTUBE_API_KEY");
  return key;
}

class YouTubeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "YouTubeError";
  }
}

/**
 * `revalidate` en segundos guarda la respuesta en el cache de Next. Sin eso
 * cada llamada va sin cache, que es lo correcto para la sincronizacion —ahi se
 * quiere el estado de este momento— pero rompe una pagina estatica: una sola
 * peticion sin cache la obliga a renderizarse en cada visita.
 */
async function call<T>(
  path: string,
  params: Record<string, string>,
  revalidate?: number,
): Promise<T> {
  const url = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey());

  const res = await fetch(
    url,
    revalidate === undefined ? { cache: "no-store" } : { next: { revalidate } },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new YouTubeError(
      `YouTube ${path} respondio ${res.status}: ${body.slice(0, 300)}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

/**
 * Resolves the channel's "uploads" playlist. Accepts either a channel id
 * (UC...) or a handle (@onnismeeks), so setup only needs one env var.
 */
export async function getUploadsPlaylistId(): Promise<string> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE?.trim();

  const params: Record<string, string> = { part: "contentDetails" };
  if (channelId) params.id = channelId;
  else if (handle) params.forHandle = handle.startsWith("@") ? handle : `@${handle}`;
  else throw new Error("Configura YOUTUBE_CHANNEL_ID o YOUTUBE_CHANNEL_HANDLE");

  const data = await call<{
    items?: Array<{ contentDetails: { relatedPlaylists: { uploads: string } } }>;
  }>("channels", params);

  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("No se encontro el canal de YouTube");
  return uploads;
}

/** Video ids in the uploads playlist, newest first. */
export async function listUploadIds(max = 200): Promise<string[]> {
  const playlistId = await getUploadsPlaylistId();
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    let data: {
      items?: Array<{ contentDetails: { videoId: string } }>;
      nextPageToken?: string;
    };

    try {
      data = await call("playlistItems", {
        part: "contentDetails",
        playlistId,
        maxResults: "50",
        ...(pageToken ? { pageToken } : {}),
      });
    } catch (error) {
      // Un canal sin videos todavia no tiene playlist de subidas: eso no es un
      // fallo, es simplemente que no hay nada para importar.
      if (error instanceof YouTubeError && error.status === 404) return [];
      throw error;
    }

    for (const item of data.items ?? []) ids.push(item.contentDetails.videoId);
    pageToken = data.nextPageToken;
  } while (pageToken && ids.length < max);

  return ids.slice(0, max);
}

/**
 * Full video records. Batched 50 at a time, which is the API limit.
 *
 * `revalidate` en segundos para las llamadas que no necesitan el dato fresco,
 * como la duracion de un video, que no cambia.
 */
export async function getVideos(
  ids: string[],
  revalidate?: number,
): Promise<YouTubeVideo[]> {
  const out: YouTubeVideo[] = [];

  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const data = await call<{
      items?: Array<{
        id: string;
        snippet: {
          title: string;
          description: string;
          publishedAt: string;
          tags?: string[];
          thumbnails?: Record<string, { url: string; width: number }>;
        };
        contentDetails: { duration: string };
      }>;
    }>("videos", { part: "snippet,contentDetails", id: batch.join(",") }, revalidate);

    for (const item of data.items ?? []) {
      const thumbs = item.snippet.thumbnails ?? {};
      const best = Object.values(thumbs).sort((a, b) => b.width - a.width)[0];

      out.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description ?? "",
        publishedAt: item.snippet.publishedAt,
        thumbnail: best?.url ?? null,
        durationSeconds: parseIsoDuration(item.contentDetails?.duration),
        tags: item.snippet.tags ?? [],
      });
    }
  }

  return out;
}

/**
 * Devuelve la miniatura de mayor resolucion que exista de verdad.
 *
 * No alcanza con mirar snippet.thumbnails: YouTube tarda algunos minutos en
 * generar maxresdefault, asi que un video recien subido reporta como maxima la
 * de 480x360. Guardar esa y estirarla a 3840 en desktop es lo que se veia mal.
 *
 * Cuando el archivo no existe, YouTube responde 404 o devuelve una imagen gris
 * de relleno que pesa alrededor de 1 KB, por eso tambien se mira el tamano.
 */
const THUMB_VARIANTS = ["maxresdefault", "hq720", "sddefault", "hqdefault"] as const;
const PLACEHOLDER_MAX_BYTES = 2500;

export async function bestThumbnail(youtubeId: string): Promise<string> {
  for (const variant of THUMB_VARIANTS) {
    const url = `https://i.ytimg.com/vi/${youtubeId}/${variant}.jpg`;
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (!res.ok) continue;

      const size = Number(res.headers.get("content-length") ?? "0");
      if (size > 0 && size <= PLACEHOLDER_MAX_BYTES) continue;

      return url;
    } catch {
      // Error de red puntual: se prueba la siguiente variante.
    }
  }

  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function isYouTubeConfigured(): boolean {
  return Boolean(
    process.env.YOUTUBE_API_KEY &&
      (process.env.YOUTUBE_CHANNEL_ID || process.env.YOUTUBE_CHANNEL_HANDLE),
  );
}
