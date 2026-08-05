import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ActionLink } from "@/components/ui/action";
import { JsonLd } from "@/components/json-ld";
import { getProjects } from "@/lib/db/projects";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: "Detrás de cámara",
  description:
    "Making of, fotos de rodaje y material de archivo de los proyectos del estudio.",
  path: "/detras-de-camara",
});

export default async function BehindTheScenesPage() {
  const projects = await getProjects({}, 60);

  const clips = projects.flatMap((project) =>
    project.makingOf.map((video) => ({ project, video })),
  );

  const stills = projects.flatMap((project) =>
    project.gallery.map((image) => ({ project, image })),
  );

  const hasContent = clips.length > 0 || stills.length > 0;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Detrás de cámara", path: "/detras-de-camara" },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pt-32 md:px-10 md:pt-40">
        <header className="max-w-[20ch]">
          <h1 className="display font-display text-[12vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[10vw] lg:text-[6.4vw]">
            Detrás de cámara
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-paper-dim md:text-lg">
            Cómo se arma cada pieza antes de que quede prolija. Material de
            rodaje, pruebas y descartes.
          </p>
        </header>
      </div>

      {!hasContent && (
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
          <div className="border border-line px-6 py-16 md:px-12 md:py-24">
            <h2 className="max-w-[24ch] font-display text-2xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
              Todavía no hay material de rodaje cargado
            </h2>
            <p className="mt-5 max-w-[56ch] text-paper-dim">
              El making of y las fotos se agregan desde la descripción del video
              en YouTube, con los campos{" "}
              <code className="font-mono text-sm text-flame-warm">MAKINGOF:</code> y{" "}
              <code className="font-mono text-sm text-flame-warm">GALERIA:</code>, o
              desde el panel de administración.
            </p>
            <ActionLink href="/proyectos" variant="ghost" className="mt-8">
              Ver proyectos
            </ActionLink>
          </div>
        </div>
      )}

      {clips.length > 0 && (
        <section className="py-16 md:py-24">
          <h2 className="mx-auto mb-8 max-w-[1600px] px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-flame md:px-10">
            Making of
          </h2>

          {/* Tira horizontal con scroll nativo: funciona igual con rueda, trackpad,
              dedo y teclado, sin secuestrar el scroll de la página. */}
          <ul className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:px-10 [scrollbar-width:thin]">
            {clips.map(({ project, video }, i) => (
              <li
                key={`${project.id}-${i}`}
                className="w-[86vw] shrink-0 snap-start sm:w-[62vw] lg:w-[44vw]"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-ink-700">
                  {video.youtubeId ? (
                    <iframe
                      title={`${video.label}, ${project.projectName ?? project.title}`}
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
                <div className="flex items-baseline justify-between gap-4 pt-4">
                  <p className="text-sm text-paper">{video.label}</p>
                  <Link
                    href={`/proyectos/${project.slug}`}
                    className="shrink-0 text-sm text-paper-dim transition-colors hover:text-flame-warm"
                  >
                    {project.projectName ?? project.title}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stills.length > 0 && (
        <section className="mx-auto max-w-[1600px] border-t border-line px-5 py-16 md:px-10 md:py-24">
          <h2 className="mb-10 font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
            Fotos de rodaje
          </h2>
          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
            {stills.map(({ project, image }, i) => (
              <li key={`${image.url}-${i}`} className="break-inside-avoid">
                <Link href={`/proyectos/${project.slug}`} className="group block">
                  <div className="relative w-full overflow-hidden bg-ink-700">
                    <Image
                      src={image.url}
                      alt={image.alt || `Rodaje de ${project.projectName ?? project.title}`}
                      width={image.width ?? 1200}
                      height={image.height ?? 800}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-auto w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
