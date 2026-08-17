"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PlayIcon } from "@phosphor-icons/react";
import { ActionLink } from "@/components/ui/action";
import { Magnetic } from "@/components/ui/magnetic";
import { RevealLines } from "@/components/ui/reveal";
import { VideoLightbox } from "@/components/media/video-lightbox";
import { VideoBackdrop } from "@/components/media/video-backdrop";

/**
 * Hero a sangre completa con un solo video de fondo, mudo y en loop.
 *
 * Si hay showreel cargado, manda el showreel. Si no, corre el ultimo trabajo
 * publicado, que es material real y se actualiza solo.
 */
export function Hero({
  poster,
  showreelId,
  backdropId,
  mp4 = null,
  titulo1,
  titulo2,
  bajada,
}: {
  poster: string | null;
  showreelId: string;
  backdropId: string | null;
  /** Archivo propio para el fondo. Si esta, se usa en lugar de YouTube. */
  mp4?: string | null;
  titulo1: string;
  titulo2: string;
  bajada: string;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden">
      <VideoBackdrop
        mp4={mp4}
        youtubeId={showreelId || backdropId}
        poster={poster}
        alt=""
        priority
        siempre
      />

      {/* Velo de dos capas para que el titular no dependa del fotograma. */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/50" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-16 pt-24 md:px-10 md:pb-20">
        {/* Sin límite de ancho: el corte de línea ya está decidido a mano en
            RevealLines, y un max-width acá obligaba a "TERMINAMOS" a partirse. */}
        <h1 className="display font-display text-[10.5vw] font-extrabold uppercase tracking-[-0.045em] text-paper sm:text-[9vw] lg:text-[min(6.2vw,99.2px)]">
          {/*
            La primera linea se parte por el ultimo espacio hasta 1024: en un
            telefono no entra entera, y cortar la palabra queda peor que agregar
            el salto.
          */}
          <RevealLines
            lines={[
              <span key="1">
                {titulo1.slice(0, titulo1.lastIndexOf(" ") + 1)}
                <br className="lg:hidden" />
                {titulo1.slice(titulo1.lastIndexOf(" ") + 1)}
              </span>,
              <span key="2" className="flame-text">
                {titulo2}
              </span>,
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
            {bajada}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <ActionLink href="/proyectos" arrow>
                Ver proyectos
              </ActionLink>
            </Magnetic>
            <Magnetic>
              <ActionLink href="/contacto" variant="ghost">
                Contacto
              </ActionLink>
            </Magnetic>

            {showreelId && (
              <Magnetic className="ml-1">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-label="Reproducir showreel con sonido"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line text-paper transition-colors duration-300 hover:border-flame-warm hover:text-flame-warm"
                >
                  <PlayIcon size={17} weight="fill" />
                </button>
              </Magnetic>
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
