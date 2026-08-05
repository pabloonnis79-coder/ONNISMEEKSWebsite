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

async function call<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey());

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube ${path} respondio ${res.status}: ${body.slice(0, 300)}`);
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
    const data = await call<{
      items?: Array<{ contentDetails: { videoId: string } }>;
      nextPageToken?: string;
    }>("playlistItems", {
      part: "contentDetails",
      playlistId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });

    for (const item of data.items ?? []) ids.push(item.contentDetails.videoId);
    pageToken = data.nextPageToken;
  } while (pageToken && ids.length < max);

  return ids.slice(0, max);
}

/** Full video records. Batched 50 at a time, which is the API limit. */
export async function getVideos(ids: string[]): Promise<YouTubeVideo[]> {
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
    }>("videos", { part: "snippet,contentDetails", id: batch.join(",") });

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

export function isYouTubeConfigured(): boolean {
  return Boolean(
    process.env.YOUTUBE_API_KEY &&
      (process.env.YOUTUBE_CHANNEL_ID || process.env.YOUTUBE_CHANNEL_HANDLE),
  );
}
