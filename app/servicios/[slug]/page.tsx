import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoBackdrop } from "@/components/media/video-backdrop";
import { ProjectCard } from "@/components/project/project-card";
import { ActionLink } from "@/components/ui/action";
import { Reveal } from "@/components/ui/reveal";
import { JsonLd } from "@/components/json-ld";
import { getProjects } from "@/lib/db/projects";
import { getPhotoGalleries, getSectionVideos } from "@/lib/db/settings";
import { PhotoGalleries } from "@/components/gallery/photo-galleries";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { services, site } from "@/lib/site";
import { youtubeThumb } from "@/lib/utils";

export const revalidate = 600;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "Servicio no encontrado" };

  return pageMetadata({
    title: service.name,
    description: service.summary,
    path: `/servicios/${service.slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const [todos, sectionVideos, galerias] = await Promise.all([
    getProjects({}, 40),
    getSectionVideos(),
    service.media === "fotos" ? getPhotoGalleries() : Promise.resolve([]),
  ]);

  // Trabajos de este servicio. Si todavía nadie cargó el campo SERVICIOS en
  // las descripciones, se muestran los últimos publicados para que la página
  // no quede vacía.
  const propios = todos.filter((p) => p.services.includes(service.name));
  const proyectos = (propios.length > 0 ? propios : todos).slice(0, 6);

  const asignado = sectionVideos[service.slug];
  const respaldo = todos.find((p) => p.youtubeId);
  const videoId = asignado ?? (service.media === "video" ? respaldo?.youtubeId : null);
  const poster = videoId
    ? youtubeThumb(videoId)
    : (proyectos[0]?.coverUrl ?? null);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Servicios", path: "/servicios" },
          { name: service.name, path: `/servicios/${service.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          description: service.summary,
          serviceType: service.name,
          areaServed: site.contact.city,
          provider: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />

      <section className="relative flex min-h-[78vh] items-end overflow-hidden">
        <VideoBackdrop
          youtubeId={videoId ?? null}
          poster={poster}
          alt=""
          priority
          siempre
        />
        <div aria-hidden="true" className="absolute inset-0 bg-ink/55" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/25"
        />

        <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-16 pt-28 md:px-10 md:pb-20">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
            Servicios
          </p>
          <h1 className="display max-w-[14ch] font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] text-paper sm:text-[9vw] lg:text-[min(6.4vw,102.4px)]">
            {service.name}
          </h1>
          <p className="mt-7 max-w-[56ch] text-base leading-relaxed text-paper-dim md:text-lg">
            {service.summary}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-faint">
          Qué incluye
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {service.includes.map((item, i) => (
            <li key={item}>
              <Reveal delay={(i % 3) * 0.05}>
                <p className="display border-t border-line py-5 font-display text-xl font-extrabold uppercase tracking-[-0.03em] text-paper md:text-2xl">
                  {item}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Fotografía: en vez del listado de piezas, sus galerías por categoría. */}
      <PhotoGalleries galerias={galerias} />

      {service.media !== "fotos" && proyectos.length > 0 && (
        <section className="mx-auto max-w-[1600px] border-t border-line px-5 py-16 md:px-10 md:py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <h2 className="display font-display text-[10vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6.5vw] lg:text-[min(4vw,64px)]">
              {propios.length > 0 ? "Trabajos" : "Últimos trabajos"}
            </h2>
            <Link
              href="/proyectos"
              className="text-sm font-medium text-flame-warm transition-opacity hover:opacity-70"
            >
              Ver todos los proyectos
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 md:gap-y-20">
            {proyectos.map((project, i) => (
              <Reveal key={project.id} delay={i % 2 === 1 ? 0.08 : 0}>
                <ProjectCard
                  project={project}
                  size="sm"
                  sizes="(max-width: 768px) 100vw, 48vw"
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line bg-ink-800">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-10 md:py-28">
          <h2 className="display max-w-[18ch] font-display text-[10vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[6.5vw] lg:text-[min(4vw,64px)]">
            Contanos qué hay que filmar
          </h2>
          <ActionLink href="/contacto" arrow className="self-start">
            Contacto
          </ActionLink>
        </div>
      </section>
    </>
  );
}
