import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { enrichProject } from "@/lib/ai/enrich";
import { buildSlug, parseDescription } from "@/lib/youtube/parser";
import {
  bestThumbnail,
  getVideos,
  listUploadIds,
  type YouTubeVideo,
} from "@/lib/youtube/api";
import type { SyncSummary } from "@/lib/types";
import { hashString, slugify } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

type ExistingRow = {
  id: string;
  slug: string;
  description_hash: string | null;
  locked_fields: string[] | null;
  ai_summary: string | null;
};

/** Garantiza un slug unico aun si dos proyectos comparten cliente y nombre. */
async function ensureUniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  candidate: string,
  youtubeId: string,
): Promise<string> {
  const { data } = await supabase
    .from("projects")
    .select("slug, youtube_id")
    .eq("slug", candidate)
    .maybeSingle();

  if (!data || data.youtube_id === youtubeId) return candidate;
  return `${candidate}-${youtubeId.slice(0, 5).toLowerCase()}`;
}

async function syncVideo(
  supabase: ReturnType<typeof createAdminClient>,
  video: YouTubeVideo,
  summary: SyncSummary,
  force: boolean,
): Promise<void> {
  const parsed = parseDescription(video.description);
  const hash = hashString(video.description + video.title);

  const { data: existing } = (await supabase
    .from("projects")
    .select("id, slug, description_hash, locked_fields, ai_summary")
    .eq("youtube_id", video.id)
    .maybeSingle()) as { data: ExistingRow | null };

  // La portada se recalcula siempre, incluso si el texto no cambio: YouTube
  // publica la miniatura grande varios minutos despues de subir el video.
  const cover = parsed.coverUrl ?? (await bestThumbnail(video.id));

  const unchanged =
    existing && existing.description_hash === hash && existing.ai_summary && !force;

  if (unchanged) {
    summary.skipped += 1;
    await supabase
      .from("projects")
      .update({ synced_at: new Date().toISOString(), cover_url: cover })
      .eq("id", existing.id);
    return;
  }

  const enrichment = await enrichProject(parsed, video.title);
  summary.enriched += 1;

  const slug =
    existing?.slug ??
    (await ensureUniqueSlug(supabase, buildSlug(parsed, video.title, video.id), video.id));

  const row: Record<string, unknown> = {
    youtube_id: video.id,
    slug,
    title: parsed.projectName ?? video.title,
    project_name: parsed.projectName,
    client_name: parsed.clientName,
    client_slug: parsed.clientName ? slugify(parsed.clientName) : null,
    year: parsed.year ?? new Date(video.publishedAt).getUTCFullYear(),
    project_date: parsed.projectDate ?? video.publishedAt.slice(0, 10),
    services: parsed.services,
    category: parsed.category,
    location: parsed.location,
    story: parsed.story,
    results: parsed.results,
    tags: parsed.tags.length > 0 ? parsed.tags : video.tags.slice(0, 10),
    cover_url: cover,
    duration_seconds: video.durationSeconds,
    published_at: video.publishedAt,
    featured: parsed.featured,
    credits: parsed.credits,
    gallery: parsed.gallery,
    making_of: parsed.makingOf,
    source: "youtube",
    raw_description: video.description,
    description_hash: hash,
    synced_at: new Date().toISOString(),

    ai_summary: enrichment.aiSummary,
    seo_title: enrichment.seoTitle,
    seo_description: enrichment.seoDescription,
    keywords: enrichment.keywords,
    home_excerpt: enrichment.homeExcerpt,
    social_linkedin: enrichment.socialLinkedin,
    social_instagram: enrichment.socialInstagram,
    social_facebook: enrichment.socialFacebook,
    ai_generated_at: new Date().toISOString(),
  };

  if (parsed.sortOrder !== null) row.sort_order = parsed.sortOrder;

  if (existing) {
    // Lo que se edito a mano en el panel gana sobre lo que trae YouTube.
    for (const field of existing.locked_fields ?? []) delete row[field];

    const { error } = await supabase.from("projects").update(row).eq("id", existing.id);
    if (error) summary.errors.push(`${video.id}: ${error.message}`);
    else summary.updated += 1;
    return;
  }

  const { error } = await supabase.from("projects").insert(row);
  if (error) summary.errors.push(`${video.id}: ${error.message}`);
  else summary.created += 1;
}

/** Crea la ficha de cliente si todavia no existe. */
async function upsertClients(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<void> {
  const { data } = await supabase
    .from("projects")
    .select("client_name, client_slug, services")
    .not("client_slug", "is", null);

  const map = new Map<string, { name: string; services: Set<string> }>();
  for (const row of (data ?? []) as any[]) {
    const entry = map.get(row.client_slug) ?? {
      name: row.client_name,
      services: new Set<string>(),
    };
    for (const s of row.services ?? []) entry.services.add(s);
    map.set(row.client_slug, entry);
  }

  for (const [slug, entry] of map) {
    await supabase
      .from("clients")
      .upsert(
        { slug, name: entry.name, services: [...entry.services] },
        { onConflict: "slug", ignoreDuplicates: false },
      );
  }
}

export type SyncOptions = {
  /** Sincroniza solo estos videos. Se usa desde el webhook de YouTube. */
  videoIds?: string[];
  /** Ignora el hash y vuelve a generar todo con IA. */
  force?: boolean;
  max?: number;
  trigger?: string;
};

export async function runSync(options: SyncOptions = {}): Promise<SyncSummary> {
  const { videoIds, force = false, max = 200, trigger = "cron" } = options;
  const supabase = createAdminClient();

  const summary: SyncSummary = {
    found: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    enriched: 0,
    errors: [],
  };

  const { data: run } = await supabase
    .from("sync_runs")
    .insert({ trigger })
    .select("id")
    .single();

  try {
    const ids = videoIds?.length ? videoIds : await listUploadIds(max);
    const videos = await getVideos(ids);
    summary.found = videos.length;

    for (const video of videos) {
      try {
        await syncVideo(supabase, video, summary, force);
      } catch (error) {
        summary.errors.push(
          `${video.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    await upsertClients(supabase);
  } catch (error) {
    summary.errors.push(error instanceof Error ? error.message : String(error));
  }

  if (run?.id) {
    await supabase
      .from("sync_runs")
      .update({
        finished_at: new Date().toISOString(),
        found: summary.found,
        created: summary.created,
        updated: summary.updated,
        enriched: summary.enriched,
        errors: summary.errors,
        status: summary.errors.length > 0 ? "partial" : "ok",
      })
      .eq("id", run.id);
  }

  return summary;
}
