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

/* --------------------------------------------- titulo de cada proyecto ---- */

/** Los buscadores cortan el titulo mas o menos ahi. Lo que sigue se pierde. */
const LARGO_MAXIMO = 60;
/** Debajo de esto el titulo desaprovecha el lugar que da el buscador. */
const LARGO_MINIMO = 30;

/**
 * El titulo de la ficha de un proyecto, con la marca al final.
 *
 * El nombre solo casi nunca alcanza —"Globant | ONNIS & MEEKS" son veintitres
 * caracteres— y algunos se pasan de largo y quedan cortados en los resultados.
 * Se completa con lo que ya sabemos del proyecto y se recorta si hace falta.
 *
 * Ojo: esto acomoda el tamano, no arregla el nombre. Un proyecto que en el
 * canal se llama "recap case ih" va a seguir apareciendo asi hasta que alguien
 * escriba el campo PROYECTO en la descripcion de YouTube.
 */
export function projectTitle(project: {
  seoTitle?: string | null;
  projectName?: string | null;
  title: string;
  category?: string | null;
  clientName?: string | null;
}): string {
  const marca = ` | ${site.name}`;

  // El titulo que dejo la sincronizacion ya trae la marca pegada.
  const nombre = (project.seoTitle ?? project.projectName ?? project.title)
    .replace(marca, "")
    .trim();

  const yaNombrado = (texto: string) => nombre.toLowerCase().includes(texto.toLowerCase());

  /*
    Se agrega lo que sirve para buscar y todavia no esta en el nombre: el rubro
    del proyecto si lo tiene cargado, y si no, lo que es. El cliente se suma
    solo cuando no aparece ya en el nombre, que es lo mas comun: la ficha de
    Globant no gana nada con decir Globant dos veces.
  */
  const agregados = [
    project.clientName && !yaNombrado(project.clientName) ? project.clientName : null,
    project.category && !yaNombrado(project.category) ? project.category : "Producción audiovisual",
  ].filter(Boolean);

  let titulo = nombre;

  for (const agregado of agregados) {
    if (titulo.length + marca.length >= LARGO_MINIMO) break;
    titulo = `${titulo} — ${agregado}`;
  }

  if (titulo.length + marca.length <= LARGO_MAXIMO) return titulo + marca;

  /*
    Recorte por palabra entera. Cortar al caracter exacto parte la ultima
    palabra al medio y se lee peor que perderla.
  */
  const disponible = LARGO_MAXIMO - marca.length - 1;
  const palabras = titulo.split(" ");
  let corto = "";

  for (const palabra of palabras) {
    if (`${corto} ${palabra}`.trim().length > disponible) break;
    corto = `${corto} ${palabra}`.trim();
  }

  return `${corto || titulo.slice(0, disponible)}…${marca}`;
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
