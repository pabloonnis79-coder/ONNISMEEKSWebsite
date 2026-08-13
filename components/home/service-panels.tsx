import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { VideoBackdrop } from "@/components/media/video-backdrop";
import { PanelPlay } from "@/components/home/panel-play";
import { services } from "@/lib/site";
import type { Project } from "@/lib/types";
import type { GaleriaFoto, VideosDeSeccion } from "@/lib/db/settings";
import { cn, youtubeThumb } from "@/lib/utils";

/**
 * Un panel casi de pantalla completa por seccion, con el nombre en grande.
 *
 * Las secciones de video llevan un trabajo corriendo de fondo; el video se
 * elige desde el panel de administracion y, si no hay ninguno asignado, se
 * cae a un proyecto publicado. La seccion de fotografia no lleva video: va
 * una grilla de imagenes, igual que en la referencia.
 */

function videoPara(
  slug: string,
  nombre: string,
  asignados: VideosDeSeccion,
  projects: Project[],
  usados: Set<string>,
) {
  const asignado = asignados[slug];
  if (asignado) return { youtubeId: asignado, cover: youtubeThumb(asignado) };

  const conVideo = projects.filter((p) => p.youtubeId);
  const elegido =
    conVideo.find((p) => p.services.includes(nombre) && !usados.has(p.id)) ??
    conVideo.find((p) => !usados.has(p.id)) ??
    conVideo[0];

  if (!elegido?.youtubeId) return null;
  usados.add(elegido.id);

  return {
    youtubeId: elegido.youtubeId,
    cover: elegido.coverUrl ?? youtubeThumb(elegido.youtubeId),
  };
}

export function ServicePanels({
  projects,
  sectionVideos,
  galerias = [],
}: {
  projects: Project[];
  sectionVideos: VideosDeSeccion;
  /** Fotos cargadas desde el panel, para la seccion de fotografia. */
  galerias?: GaleriaFoto[];
}) {
  const usados = new Set<string>();

  // Las fotos reales del estudio mandan. Si todavia no se cargo ninguna, se
  // usan las portadas de los trabajos para que el panel no quede vacio.
  const propias = galerias.flatMap((g) => g.fotos);

  const stills =
    propias.length > 0
      ? propias.slice(0, 8).map((url, i) => ({ url, alt: "", slug: `foto-${i}` }))
      : projects
          .map((p) => ({
            url: p.coverUrl ?? (p.youtubeId ? youtubeThumb(p.youtubeId) : null),
            alt: p.projectName ?? p.title,
            slug: p.slug,
          }))
          .filter((s): s is { url: string; alt: string; slug: string } => Boolean(s.url))
          .slice(0, 8);

  return (
    <section aria-label="Servicios">
      {services.map((service, i) => {
        const esFoto = service.media === "fotos";
        const media = esFoto
          ? null
          : videoPara(service.slug, service.name, sectionVideos, projects, usados);

        // Los paneles alternan lado: el primero a la izquierda, el segundo a
        // la derecha. Cinco bloques identicos uno abajo del otro se leen como
        // una lista; alternando, cada uno se lee como una pieza.
        const derecha = i % 2 === 1;

        return (
          <article
            key={service.slug}
            className="relative flex min-h-[78vh] items-end overflow-hidden border-t border-line"
          >
            {esFoto ? (
              <PhotoGrid stills={stills} />
            ) : (
              <VideoBackdrop
                youtubeId={media?.youtubeId ?? null}
                poster={media?.cover ?? null}
                alt=""
                priority={i === 0}
              />
            )}

            {/* Velo de dos capas: el titular tiene que leerse sobre cualquier
                fotograma, y los fotogramas cambian todo el tiempo. */}
            <div aria-hidden="true" className="absolute inset-0 bg-ink/55" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent"
            />

            {/* Solo donde hay video que escuchar. */}
            {media?.youtubeId && (
              <PanelPlay youtubeId={media.youtubeId} titulo={service.name} />
            )}

            <div
              className={cn(
                "relative mx-auto w-full max-w-[1600px] px-5 pb-16 md:px-10 md:pb-24",
                derecha && "md:text-right",
              )}
            >
              {/* 11vw y no 13: "audiovisual" y "fotográfica" son 11 caracteres,
                  que a 13vw piden 93vw de ancho y no entran en un teléfono. */}
              <h2
                className={cn(
                  "display max-w-[14ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.05em] text-paper sm:text-[9vw] lg:text-[min(6.4vw,102.4px)]",
                  derecha && "md:ml-auto",
                )}
              >
                {service.name}
              </h2>

              <div
                className={cn(
                  "mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between",
                  derecha && "md:flex-row-reverse",
                )}
              >
                <p
                  className={cn(
                    "max-w-[54ch] text-base leading-relaxed text-paper-dim md:text-lg",
                    derecha && "md:ml-auto",
                  )}
                >
                  {service.summary}
                </p>

                <Link
                  href={`/servicios/${service.slug}`}
                  className="group inline-flex shrink-0 items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:text-flame-warm"
                >
                  Ver más
                  <ArrowRightIcon
                    size={16}
                    weight="bold"
                    className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
                  />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

/** Fondo de la seccion de fotografia. Imagenes quietas, sin movimiento. */
function PhotoGrid({
  stills,
}: {
  stills: Array<{ url: string; alt: string; slug: string }>;
}) {
  if (stills.length === 0) return <div className="absolute inset-0 bg-ink-800" />;

  return (
    <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 gap-1 lg:grid-cols-4">
      {stills.map((still, i) => (
        <div key={`${still.slug}-${i}`} className="relative overflow-hidden bg-ink-800">
          <Image
            src={still.url}
            alt=""
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            quality={75}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
