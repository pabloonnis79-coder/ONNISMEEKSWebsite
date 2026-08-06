"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { PlayIcon } from "@phosphor-icons/react";
import { ActionLink } from "@/components/ui/action";
import { RevealLines } from "@/components/ui/reveal";
import { VideoLightbox } from "@/components/media/video-lightbox";
import { FragmentWall } from "@/components/home/fragment-wall";
import type { Project } from "@/lib/types";

export function Hero({
  poster,
  showreelId,
  loopMp4,
  projects,
}: {
  poster: string | null;
  showreelId: string;
  loopMp4: string;
  projects: Project[];
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Parallax leve del fondo. Solo transform y opacity, sin layout.
  const mediaY = useTransform(scrollYProgress, [0, 0.35], ["0%", "12%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden">
      <motion.div
        style={reduce ? undefined : { y: mediaY, scale: mediaScale }}
        className="absolute inset-0"
      >
        {loopMp4 ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster ?? undefined}
          >
            <source src={loopMp4} type="video/mp4" />
          </video>
        ) : projects.length > 0 ? (
          <FragmentWall projects={projects} />
        ) : poster ? (
          <Image
            src={poster}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-ink-700" />
        )}
      </motion.div>

      {/*
        Velo en tres capas. El muro de fragmentos es mucho mas ruidoso que una
        foto sola, asi que hace falta una base pareja ademas del degrade, para
        que el titular mantenga contraste sobre cualquier combinacion.
      */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/60" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-16 pt-24 md:px-10 md:pb-20">
        <h1 className="display max-w-[16ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.045em] text-paper sm:text-[10vw] lg:text-[6.6vw]">
          <RevealLines
            lines={[
              <>
                Dirigimos, filmamos
              </>,
              <>
                y <span className="flame-text">terminamos</span>.
              </>,
            ]}
            delay={0.15}
          />
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[46ch] text-base leading-relaxed text-paper-dim md:text-lg"
          >
            Publicidad, branded content y documental de marca. Rodaje, post y
            entrega final en un mismo estudio.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-3"
          >
            <ActionLink href="/proyectos" arrow>
              Ver proyectos
            </ActionLink>
            <ActionLink href="/contacto" variant="ghost">
              Contacto
            </ActionLink>

            {showreelId && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Reproducir showreel"
                className="ml-1 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line text-paper transition-colors duration-300 hover:border-flame-warm hover:text-flame-warm"
              >
                <PlayIcon size={17} weight="fill" />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {showreelId && (
        <VideoLightbox
          youtubeId={showreelId}
          open={open}
          onClose={() => setOpen(false)}
          title="Showreel"
        />
      )}
    </section>
  );
}
