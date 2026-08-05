export type ProjectStatus = "draft" | "published";
export type ProjectSource = "youtube" | "manual";

export type Credit = {
  role: string;
  name: string;
};

export type GalleryItem = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type ExtraVideo = {
  /** YouTube id or a full URL for self-hosted files. */
  youtubeId?: string;
  url?: string;
  label: string;
};

/**
 * A project. Fields are populated by the YouTube sync (parsed from the video
 * description), enriched by the AI pass, and optionally overridden from admin.
 */
export type Project = {
  id: string;
  youtubeId: string | null;
  slug: string;
  title: string;
  projectName: string | null;
  clientName: string | null;
  clientSlug: string | null;
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
  hidden: boolean;
  sortOrder: number;
  status: ProjectStatus;
  source: ProjectSource;
  durationSeconds: number | null;
  publishedAt: string | null;
  credits: Credit[];
  gallery: GalleryItem[];
  extraVideos: ExtraVideo[];
  makingOf: ExtraVideo[];

  // AI generated
  aiSummary: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string[];
  homeExcerpt: string | null;
  socialLinkedin: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
};

export type Client = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  /** Simple Icons slug, used when there is no uploaded logo file. */
  logoSlug: string | null;
  story: string | null;
  website: string | null;
  services: string[];
  sortOrder: number;
};

export type SyncSummary = {
  found: number;
  created: number;
  updated: number;
  skipped: number;
  enriched: number;
  errors: string[];
};

export type ProjectFilters = {
  q?: string;
  client?: string;
  year?: number;
  category?: string;
  service?: string;
};
