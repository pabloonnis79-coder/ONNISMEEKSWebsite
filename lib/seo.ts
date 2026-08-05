import type { Metadata } from "next";
import { site } from "@/lib/site";
import type { Project } from "@/lib/types";
import { truncate, youtubeThumb } from "@/lib/utils";

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "video.other";
}): Metadata {
  const url = absoluteUrl(input.path);
  const image =
    input.image ??
    absoluteUrl(
      `/api/og?title=${encodeURIComponent(input.title.replace(` | ${site.name}`, ""))}`,
    );

  // El título SEO que genera la IA ya termina con la marca. Sin esto, la
  // plantilla del layout la agregaría una segunda vez.
  const carriesBrand = input.title.includes(site.name);
  const title = carriesBrand ? { absolute: input.title } : input.title;

  return {
    title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: input.type === "video.other" ? "video.other" : (input.type ?? "website"),
      url,
      siteName: site.name,
      title: input.title,
      description: input.description,
      locale: site.locale,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProductionCompany",
    "@id": absoluteUrl("/#organization"),
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    description: site.description,
    foundingDate: String(site.foundingYear),
    email: site.contact.email,
    telephone: site.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.contact.city,
      addressCountry: "AR",
    },
    sameAs: Object.values(site.social).filter(Boolean),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: site.url,
    name: site.name,
    inLanguage: "es-AR",
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/proyectos?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function projectSchema(project: Project) {
  const url = absoluteUrl(`/proyectos/${project.slug}`);
  const image = project.coverUrl ?? (project.youtubeId ? youtubeThumb(project.youtubeId) : null);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: project.projectName ?? project.title,
    description: truncate(
      project.seoDescription ?? project.aiSummary ?? project.story ?? project.title,
      300,
    ),
    url,
    uploadDate: project.publishedAt,
    thumbnailUrl: image ? [image] : undefined,
    keywords: project.keywords.join(", "),
    inLanguage: "es-AR",
    productionCompany: { "@id": absoluteUrl("/#organization") },
    creator: { "@id": absoluteUrl("/#organization") },
  };

  if (project.durationSeconds) {
    schema.duration = `PT${Math.floor(project.durationSeconds / 60)}M${project.durationSeconds % 60}S`;
  }
  if (project.youtubeId) {
    schema.embedUrl = `https://www.youtube.com/embed/${project.youtubeId}`;
  }
  if (project.clientName) {
    schema.sponsor = { "@type": "Organization", name: project.clientName };
  }

  return schema;
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
