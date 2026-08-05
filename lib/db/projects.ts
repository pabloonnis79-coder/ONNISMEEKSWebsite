import "server-only";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { demoClients, demoProjects } from "@/lib/demo";
import type { Client, Project, ProjectFilters } from "@/lib/types";
import { youtubeThumb } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SELECT = `
  id, youtube_id, slug, title, project_name, client_name, client_slug, year,
  project_date, services, category, location, story, results, tags, cover_url,
  featured, hidden, sort_order, status, source, duration_seconds, published_at,
  credits, gallery, extra_videos, making_of, ai_summary, seo_title,
  seo_description, keywords, home_excerpt, social_linkedin, social_instagram,
  social_facebook
`;

export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

function mapRow(row: any): Project {
  return {
    id: row.id,
    youtubeId: row.youtube_id ?? null,
    slug: row.slug,
    title: row.title,
    projectName: row.project_name ?? null,
    clientName: row.client_name ?? null,
    clientSlug: row.client_slug ?? null,
    year: row.year ?? null,
    projectDate: row.project_date ?? null,
    services: row.services ?? [],
    category: row.category ?? null,
    location: row.location ?? null,
    story: row.story ?? null,
    results: row.results ?? null,
    tags: row.tags ?? [],
    coverUrl: row.cover_url ?? (row.youtube_id ? youtubeThumb(row.youtube_id) : null),
    featured: Boolean(row.featured),
    hidden: Boolean(row.hidden),
    sortOrder: row.sort_order ?? 0,
    status: row.status ?? "published",
    source: row.source ?? "youtube",
    durationSeconds: row.duration_seconds ?? null,
    publishedAt: row.published_at ?? null,
    credits: row.credits ?? [],
    gallery: row.gallery ?? [],
    extraVideos: row.extra_videos ?? [],
    makingOf: row.making_of ?? [],
    aiSummary: row.ai_summary ?? null,
    seoTitle: row.seo_title ?? null,
    seoDescription: row.seo_description ?? null,
    keywords: row.keywords ?? [],
    homeExcerpt: row.home_excerpt ?? null,
    socialLinkedin: row.social_linkedin ?? null,
    socialInstagram: row.social_instagram ?? null,
    socialFacebook: row.social_facebook ?? null,
  };
}

function matchesInMemory(p: Project, f: ProjectFilters): boolean {
  if (f.client && p.clientSlug !== f.client) return false;
  if (f.year && p.year !== f.year) return false;
  if (f.category && p.category !== f.category) return false;
  if (f.service && !p.services.includes(f.service)) return false;
  if (f.q) {
    const haystack = [
      p.title,
      p.clientName,
      p.projectName,
      p.category,
      p.location,
      p.story,
      ...p.services,
      ...p.tags,
      ...p.keywords,
      String(p.year ?? ""),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(f.q.toLowerCase())) return false;
  }
  return true;
}

export async function getProjects(
  filters: ProjectFilters = {},
  limit = 60,
): Promise<Project[]> {
  if (isDemoMode()) {
    return demoProjects.filter((p) => matchesInMemory(p, filters)).slice(0, limit);
  }

  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select(SELECT)
    .eq("status", "published")
    .eq("hidden", false)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (filters.client) query = query.eq("client_slug", filters.client);
  if (filters.year) query = query.eq("year", filters.year);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.service) query = query.contains("services", [filters.service]);
  if (filters.q) query = query.textSearch("search_tsv", filters.q, {
    type: "websearch",
    config: "spanish",
  });

  const { data, error } = await query;
  if (error) {
    console.error("[db] getProjects:", error.message);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  if (isDemoMode()) {
    const featured = demoProjects.filter((p) => p.featured);
    const rest = demoProjects.filter((p) => !p.featured);
    return [...featured, ...rest].slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT)
    .eq("status", "published")
    .eq("hidden", false)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[db] getFeaturedProjects:", error.message);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (isDemoMode()) return demoProjects.find((p) => p.slug === slug) ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("hidden", false)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}

export async function getAllProjectSlugs(): Promise<
  Array<{ slug: string; publishedAt: string | null }>
> {
  if (isDemoMode()) {
    return demoProjects.map((p) => ({ slug: p.slug, publishedAt: p.publishedAt }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("slug, published_at")
    .eq("status", "published")
    .eq("hidden", false);

  return (data ?? []).map((r: any) => ({ slug: r.slug, publishedAt: r.published_at }));
}

/**
 * Proyecto relacionado para el pie de la ficha. Prioriza el mismo cliente,
 * despues la misma categoria, y si no hay nada, el siguiente mas reciente.
 */
export async function getRelatedProject(current: Project): Promise<Project | null> {
  const pool = await getProjects({}, 40);
  const others = pool.filter((p) => p.id !== current.id);
  if (others.length === 0) return null;

  return (
    others.find((p) => p.clientSlug && p.clientSlug === current.clientSlug) ??
    others.find((p) => p.category && p.category === current.category) ??
    others.find((p) => p.services.some((s) => current.services.includes(s))) ??
    others[0]
  );
}

export type Facets = {
  clients: Array<{ slug: string; name: string; count: number }>;
  years: number[];
  categories: string[];
  services: string[];
};

export async function getFacets(): Promise<Facets> {
  const projects = await getProjects({}, 300);

  const clientMap = new Map<string, { slug: string; name: string; count: number }>();
  const years = new Set<number>();
  const categories = new Set<string>();
  const servicesSet = new Set<string>();

  for (const p of projects) {
    if (p.clientSlug && p.clientName) {
      const entry = clientMap.get(p.clientSlug);
      if (entry) entry.count += 1;
      else clientMap.set(p.clientSlug, { slug: p.clientSlug, name: p.clientName, count: 1 });
    }
    if (p.year) years.add(p.year);
    if (p.category) categories.add(p.category);
    for (const s of p.services) servicesSet.add(s);
  }

  return {
    clients: [...clientMap.values()].sort((a, b) => a.name.localeCompare(b.name, "es")),
    years: [...years].sort((a, b) => b - a),
    categories: [...categories].sort((a, b) => a.localeCompare(b, "es")),
    services: [...servicesSet].sort((a, b) => a.localeCompare(b, "es")),
  };
}

/* ------------------------------------------------------------- clientes -- */

function mapClient(row: any): Client {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url ?? null,
    logoSlug: row.logo_slug ?? null,
    story: row.story ?? null,
    website: row.website ?? null,
    services: row.services ?? [],
    sortOrder: row.sort_order ?? 0,
  };
}

export async function getClients(): Promise<Client[]> {
  if (isDemoMode()) return demoClients;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[db] getClients:", error.message);
    return [];
  }

  const clients = (data ?? []).map(mapClient);
  if (clients.length > 0) return clients;

  // Si nadie cargo clientes a mano, los derivamos de los proyectos.
  const facets = await getFacets();
  return facets.clients.map((c, i) => ({
    id: c.slug,
    slug: c.slug,
    name: c.name,
    logoUrl: null,
    logoSlug: null,
    story: null,
    website: null,
    services: [],
    sortOrder: i,
  }));
}

export async function getClientBySlug(slug: string): Promise<Client | null> {
  const clients = await getClients();
  return clients.find((c) => c.slug === slug) ?? null;
}
