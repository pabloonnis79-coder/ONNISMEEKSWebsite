"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { services } from "@/lib/site";
import type { Project } from "@/lib/types";

type Preview = { cover: string; titulo: string; slug: string } | null;

/**
 * Indice de servicios. La imagen de la derecha muestra un trabajo real hecho
 * con ese servicio. Cuando todavia no hay ninguno, en lugar de poner una foto
 * de stock que no dice nada, se arma un panel tipografico con lo que incluye.
 */
export function ServicesIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = services[active];

  const previews = useMemo<Preview[]>(
    () =>
      services.map((service) => {
        const match = projects.find(
          (p) => p.coverUrl && p.services.some((s) => s === service.name),
        );
        return match?.coverUrl
          ? {
              cover: match.coverUrl,
              titulo: match.projectName ?? match.title,
              slug: match.slug,
            }
          : null;
      }),
    [projects],
  );

  const preview = previews[active];

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
      <div className="mb-14 md:mb-20">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Servicios
        </p>
        <h2 className="display max-w-[13ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[8vw] lg:text-[5vw]">
          Todo el proceso adentro
        </h2>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <ul className="lg:col-span-7">
          {services.map((service, i) => (
            <li key={service.slug} className="border-b border-line first:border-t">
              <Link
                href={`/servicios#${service.slug}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group flex items-center justify-between gap-6 py-5 md:py-7"
              >
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.035em] text-paper transition-colors duration-300 group-hover:text-flame md:text-[2.6vw]">
                    {service.name}
                  </h3>
                  <p className="mt-2.5 max-w-[52ch] text-sm leading-relaxed text-paper-dim lg:hidden">
                    {service.summary}
                  </p>
                </div>
                <ArrowRightIcon
                  size={20}
                  weight="bold"
                  className="shrink-0 text-paper-faint transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:text-flame"
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-800">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={current.slug}
                  initial={reduce ? false : { opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {preview ? (
                    <Link href={`/proyectos/${preview.slug}`} className="group block h-full">
                      <Image
                        src={preview.cover}
                        alt={preview.titulo}
                        fill
                        sizes="(max-width: 1024px) 0px, 40vw"
                        quality={90}
                        className="object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent"
                      />
                      <span className="absolute bottom-6 left-6 right-6 font-display text-xl font-extrabold uppercase leading-none tracking-[-0.03em] text-paper transition-colors duration-300 group-hover:text-flame-warm">
                        {preview.titulo}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col justify-between border border-line p-8">
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-flame">
                        Qué incluye
                      </p>
                      <ul className="space-y-3">
                        {current.includes.map((item) => (
                          <li
                            key={item}
                            className="font-display text-xl font-extrabold uppercase leading-none tracking-[-0.03em] text-paper"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-paper-dim">
              {current.summary}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
