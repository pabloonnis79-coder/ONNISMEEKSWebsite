import { Suspense } from "react";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectFilters } from "@/components/project/project-filters";
import { Reveal } from "@/components/ui/reveal";
import { ActionLink } from "@/components/ui/action";
import { JsonLd } from "@/components/json-ld";
import { getFacets, getProjects } from "@/lib/db/projects";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Proyectos",
  description:
    "Publicidad, branded content, documental de marca e institucional. Buscá por cliente, año, categoría o servicio.",
  path: "/proyectos",
});

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const year = Number(one("anio"));

  const [projects, facets] = await Promise.all([
    getProjects({
      q: one("q"),
      client: one("cliente"),
      category: one("categoria"),
      service: one("servicio"),
      year: Number.isFinite(year) && year > 0 ? year : undefined,
    }),
    getFacets(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Proyectos", path: "/proyectos" },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40">
        <header className="mb-12 md:mb-16">
          <h1 className="display max-w-[12ch] font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[11vw] lg:text-[7vw]">
            Proyectos
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-paper-dim md:text-lg">
            Cada ficha se arma sola con lo que publicamos en YouTube. Filtrá por
            cliente, año, categoría o servicio.
          </p>
        </header>

        <Suspense fallback={<div className="h-40 border-y border-line" />}>
          <ProjectFilters facets={facets} total={projects.length} />
        </Suspense>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 md:gap-y-20">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={i % 2 === 1 ? 0.08 : 0}>
                <ProjectCard
                  project={project}
                  priority={i < 2}
                  size={i % 3 === 0 ? "md" : "sm"}
                  sizes="(max-width: 768px) 100vw, 48vw"
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-start gap-6 border border-line px-6 py-16 md:px-12 md:py-24">
      <h2 className="font-display text-3xl font-extrabold uppercase tracking-[-0.035em] md:text-5xl">
        No hay proyectos con ese filtro
      </h2>
      <p className="max-w-[52ch] text-paper-dim">
        Probá con otro cliente o sacá algún filtro. Si recién estás conectando el
        canal, los proyectos aparecen acá en cuanto corre la primera
        sincronización.
      </p>
      <ActionLink href="/proyectos" variant="ghost">
        Ver todo
      </ActionLink>
    </div>
  );
}
