"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { services } from "@/lib/site";

/**
 * Indice de servicios. La imagen de la derecha cambia con el servicio que el
 * cursor esta recorriendo: sirve para asociar cada disciplina con como se ve,
 * que es exactamente lo que el visitante vino a averiguar.
 */
export function ServicesIndex() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = services[active];

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
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-700">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={current.slug}
                  initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {/* TODO: reemplazar por fotos reales de rodaje del estudio. */}
                  <Image
                    src={`https://picsum.photos/seed/om-${current.slug}/900/1125`}
                    alt={current.name}
                    fill
                    sizes="40vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent"
              />
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
