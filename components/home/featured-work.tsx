import { ProjectCard } from "@/components/project/project-card";
import { Reveal } from "@/components/ui/reveal";
import { TextLink } from "@/components/ui/action";
import type { Project } from "@/lib/types";

/**
 * Grilla asimetrica de 12 columnas. El patron 12 / 7+5 / 5+7 cierra cada fila
 * exacta, asi que nunca queda una celda vacia, entren cuatro proyectos o doce.
 */
const SPANS = [12, 7, 5, 5, 7] as const;
const SIZES = ["lg", "md", "sm", "sm", "md"] as const;

const COL_CLASS: Record<number, string> = {
  12: "lg:col-span-12",
  7: "lg:col-span-7",
  5: "lg:col-span-5",
};

export function FeaturedWork({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
        <h2 className="display font-display text-[9vw] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] lg:text-[min(4.4vw,70.4px)]">
          Todavía no hay proyectos publicados
        </h2>
        <p className="mt-6 max-w-[52ch] text-paper-dim">
          En cuanto se publique el primer video en el canal con la descripción
          completa, el proyecto aparece acá solo.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
      <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
        <div>
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
            Trabajos
          </p>
          <h2 className="display max-w-[14ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[8vw] lg:text-[min(5vw,80px)]">
            Lo último que salió del estudio
          </h2>
        </div>
        <TextLink href="/proyectos">Ver todos</TextLink>
      </Reveal>

      <div className="grid grid-cols-1 gap-x-6 gap-y-16 lg:grid-cols-12 lg:gap-y-24">
        {projects.map((project, i) => {
          const step = i % SPANS.length;
          return (
            <Reveal
              key={project.id}
              delay={step === 2 || step === 4 ? 0.08 : 0}
              className={COL_CLASS[SPANS[step]]}
            >
              <ProjectCard
                project={project}
                size={SIZES[step]}
                priority={i === 0}
                // En la portada las tarjetas se reproducen solas al entrar en
                // pantalla. En el listado de proyectos no: ahi hay decenas y
                // serian decenas de reproductores.
                auto
                sizes={
                  SPANS[step] === 12
                    ? "(max-width: 1024px) 100vw, 1560px"
                    : "(max-width: 1024px) 100vw, 50vw"
                }
              />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
