import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

import { PlayableCover } from "@/components/project/playable-cover";
import { Reveal } from "@/components/ui/reveal";
import { JsonLd } from "@/components/json-ld";
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getRelatedProject,
} from "@/lib/db/projects";
import { breadcrumbSchema, pageMetadata, projectSchema } from "@/lib/seo";
import type { Project } from "@/lib/types";
import { formatDateEs, formatDuration, truncate, youtubeThumb } from "@/lib/utils";

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

function posterFor(project: Project): string | null {
  return (
    project.coverUrl ?? (project.youtubeId ? youtubeThumb(project.youtubeId) : null)
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Proyecto no encontrado" };

  const title = project.projectName ?? project.title;

  return pageMetadata({
    title: project.seoTitle ?? title,
    description:
      project.seoDescription ??
      truncate(project.aiSummary ?? project.story ?? title, 155),
    path: `/proyectos/${project.slug}`,
    image: posterFor(project),
    type: "video.other",
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = await getRelatedProject(project);
  const title = project.projectName ?? project.title;
  const poster = posterFor(project);

  const meta = [
    project.clientName && { label: "Cliente", value: project.clientName, href: project.clientSlug ? `/clientes/${project.clientSlug}` : null },
    project.year && { label: "Año", value: String(project.year), href: null },
    project.projectDate && { label: "Fecha", value: formatDateEs(project.projectDate), href: null },
    project.category && { label: "Categoría", value: project.category, href: null },
    project.location && { label: "Ubicación", value: project.location, href: null },
    project.durationSeconds && { label: "Duración", value: formatDuration(project.durationSeconds), href: null },
  ].filter(Boolean) as Array<{ label: string; value: string; href: string | null }>;

  return (
    <>
      <JsonLd data={projectSchema(project)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Proyectos", path: "/proyectos" },
          { name: title, path: `/proyectos/${project.slug}` },
        ])}
      />

      <article>
        <header className="mx-auto max-w-[1600px] px-5 pb-10 pt-32 md:px-10 md:pb-14 md:pt-40">
          {project.clientName && (
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
              {project.clientName}
            </p>
          )}
          <h1 className="display max-w-[16ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[9vw] lg:text-[min(6vw,96px)]">
            {title}
          </h1>
        </header>

        <div className="mx-auto max-w-[1600px] px-0 md:px-10">
          <PlayableCover youtubeId={project.youtubeId} poster={poster} title={title} />
        </div>

        {/* Ficha técnica */}
        <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm font-medium text-paper md:text-base">
                  {item.href ? (
                    <Link href={item.href} className="transition-colors hover:text-flame-warm">
                      {item.value}
                    </Link>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {project.services.length > 0 && (
            <div className="mt-14 border-t border-line pt-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                Servicios
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.services.map((service) => (
                  <li key={service}>
                    <Link
                      href={`/proyectos?servicio=${encodeURIComponent(service)}`}
                      className="inline-flex rounded-full border border-line px-4 py-2 text-sm text-paper-dim transition-colors hover:border-flame-warm hover:text-flame-warm"
                    >
                      {service}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Historia y resultado */}
        {(project.story || project.results || project.aiSummary) && (
          <section className="border-y border-line bg-ink-800">
            <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12 lg:gap-16">
              {project.story && (
                <div className="lg:col-span-7">
                  <h2 className="display font-display text-[9vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6vw] lg:text-[min(3.2vw,51.2px)]">
                    El proyecto
                  </h2>
                  <div className="mt-8 space-y-5 text-base leading-relaxed text-paper-dim md:text-lg">
                    {project.story.split(/\n{2,}/).map((paragraph, i) => (
                      <p key={i} className="max-w-[62ch]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="lg:col-span-5 lg:pt-4">
                {project.results && (
                  <div className="border-l-2 border-flame pl-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-flame">
                      Resultado
                    </p>
                    <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-paper">
                      {project.results}
                    </p>
                  </div>
                )}

                {!project.results && project.aiSummary && (
                  <p className="max-w-[46ch] text-base leading-relaxed text-paper-dim">
                    {project.aiSummary}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Galería */}
        {project.gallery.length > 0 && (
          <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
            <h2 className="display font-display text-[9vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6vw] lg:text-[min(3.2vw,51.2px)]">
              Galería
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((item, i) => (
                <Reveal key={item.url} delay={(i % 3) * 0.06}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-700">
                    <Image
                      src={item.url}
                      alt={item.alt || `${title}, imagen ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] hover:scale-[1.03]"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Making of y videos adicionales */}
        {(project.makingOf.length > 0 || project.extraVideos.length > 0) && (
          <section className="mx-auto max-w-[1600px] border-t border-line px-5 py-20 md:px-10 md:py-28">
            <h2 className="display font-display text-[9vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6vw] lg:text-[min(3.2vw,51.2px)]">
              Detrás de cámara
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[...project.makingOf, ...project.extraVideos].map((video, i) => (
                <div key={`${video.youtubeId ?? video.url}-${i}`}>
                  <div className="relative aspect-video w-full overflow-hidden bg-ink-700">
                    {video.youtubeId ? (
                      <iframe
                        title={video.label}
                        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        loading="lazy"
                        className="h-full w-full border-0"
                      />
                    ) : video.url ? (
                      <video controls preload="none" className="h-full w-full object-cover">
                        <source src={video.url} type="video/mp4" />
                      </video>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-paper-dim">{video.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Créditos */}
        {project.credits.length > 0 && (
          <section className="mx-auto max-w-[1600px] border-t border-line px-5 py-20 md:px-10 md:py-28">
            <h2 className="display font-display text-[9vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6vw] lg:text-[min(3.2vw,51.2px)]">
              Créditos
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {project.credits.map((credit) => (
                <div key={`${credit.role}-${credit.name}`}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                    {credit.role}
                  </p>
                  <p className="mt-1.5 text-base text-paper">{credit.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Siguiente proyecto */}
        {related && <NextProject project={related} />}
      </article>
    </>
  );
}

function NextProject({ project }: { project: Project }) {
  const title = project.projectName ?? project.title;
  const poster = posterFor(project);

  return (
    <section className="border-t border-line">
      <Link href={`/proyectos/${project.slug}`} className="group block">
        <div className="mx-auto grid max-w-[1600px] items-center gap-8 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
              Siguiente proyecto
            </p>
            <h2 className="display mt-5 font-display text-[11vw] font-extrabold uppercase tracking-[-0.05em] text-paper transition-colors duration-300 group-hover:text-flame-warm sm:text-[7vw] lg:text-[min(4.4vw,70.4px)]">
              {title}
            </h2>
            <p className="mt-4 flex items-center gap-2 text-sm text-paper-dim">
              {project.clientName}
              <ArrowRightIcon
                size={16}
                weight="bold"
                className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
              />
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-800">
              {poster && (
                <Image
                  src={poster}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  quality={90}
                  className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
              )}
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

export const dynamicParams = true;
