import type { MetadataRoute } from "next";
import { getAllProjectSlugs, getClients } from "@/lib/db/projects";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, clients] = await Promise.all([getAllProjectSlugs(), getClients()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/proyectos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/servicios`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/clientes`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/estudio`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/premios`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${site.url}/detras-de-camara`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/notas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/contacto`, changeFrequency: "yearly", priority: 0.7 },
  ];

  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: `${site.url}/proyectos/${project.slug}`,
      lastModified: project.publishedAt ? new Date(project.publishedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...clients.map((client) => ({
      url: `${site.url}/clientes/${client.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
