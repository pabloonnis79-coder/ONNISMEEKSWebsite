import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { VideoBackdrop } from "@/components/media/video-backdrop";
import { services } from "@/lib/site";
import type { Project } from "@/lib/types";
import { youtubeThumb } from "@/lib/utils";

/**
 * Un panel casi de pantalla completa por servicio, con un trabajo real
 * corriendo de fondo y el nombre del servicio en grande.
 *
 * Se muestran cuatro. Con ocho la pagina se vuelve un desfile y ninguno pesa;
 * los que quedan afuera van en una tira compacta al pie de la seccion.
 */
const MAX_PANELES = 4;

function proyectoPara(service: string, projects: Project[], usados: Set<string>) {
  const conVideo = projects.filter((p) => p.youtubeId);

  return (
    conVideo.find((p) => p.services.includes(service) && !usados.has(p.id)) ??
    conVideo.find((p) => p.services.includes(service)) ??
    conVideo.find((p) => !usados.has(p.id)) ??
    conVideo[0] ??
    null
  );
}

export function ServicePanels({ projects }: { projects: Project[] }) {
  const usados = new Set<string>();

  // Primero los servicios que tienen trabajo publicado: son los que valen un
  // panel entero.
  const ordenados = [...services].sort((a, b) => {
    const ta = projects.some((p) => p.services.includes(a.name)) ? 0 : 1;
    const tb = projects.some((p) => p.services.includes(b.name)) ? 0 : 1;
    return ta - tb;
  });

  const conPanel = ordenados.slice(0, MAX_PANELES);
  const resto = ordenados.slice(MAX_PANELES);

  return (
    <section aria-label="Servicios">
      {conPanel.map((service, i) => {
        const project = proyectoPara(service.name, projects, usados);
        if (project) usados.add(project.id);

        const poster =
          project?.coverUrl ??
          (project?.youtubeId ? youtubeThumb(project.youtubeId) : null);

        return (
          <article
            key={service.slug}
            className="relative flex min-h-[86vh] items-end overflow-hidden border-t border-line"
          >
            <VideoBackdrop
              youtubeId={project?.youtubeId ?? null}
              poster={poster}
              alt=""
              priority={i === 0}
            />

            {/* Velo de dos capas: el titular tiene que leerse sobre cualquier
                fotograma, y los fotogramas cambian todo el tiempo. */}
            <div aria-hidden="true" className="absolute inset-0 bg-ink/55" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent"
            />

            <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-16 md:px-10 md:pb-24">
              <h2 className="display max-w-[14ch] font-display text-[14vw] font-extrabold uppercase tracking-[-0.05em] text-paper sm:text-[10vw] lg:text-[7vw]">
                {service.name}
              </h2>

              <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between">
                <p className="max-w-[54ch] text-base leading-relaxed text-paper-dim md:text-lg">
                  {service.summary}
                </p>

                <Link
                  href={`/proyectos?servicio=${encodeURIComponent(service.name)}`}
                  className="group inline-flex shrink-0 items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:text-flame-warm"
                >
                  Ver trabajos
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

      {resto.length > 0 && (
        <div className="border-t border-line">
          <ul className="mx-auto grid max-w-[1600px] grid-cols-1 gap-px bg-line px-0 sm:grid-cols-2 lg:grid-cols-4">
            {resto.map((service) => (
              <li key={service.slug} className="bg-ink">
                <Link
                  href={`/servicios#${service.slug}`}
                  className="group flex h-full flex-col justify-between gap-8 p-7 transition-colors duration-300 hover:bg-ink-800 md:p-9"
                >
                  <h3 className="font-display text-2xl font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-paper transition-colors duration-300 group-hover:text-flame">
                    {service.name}
                  </h3>
                  <p className="max-w-[34ch] text-sm leading-relaxed text-paper-dim">
                    {service.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
