"use client";

import { useState } from "react";
import { PlayIcon } from "@phosphor-icons/react";
import { VideoBackdrop } from "@/components/media/video-backdrop";
import { VideoLightbox } from "@/components/media/video-lightbox";

/**
 * Cabecera de la ficha de proyecto.
 *
 * El video corre mudo y sin controles, igual que los fondos del resto del
 * sitio. El boton abre el reproductor completo, ahi si con sonido y controles,
 * que es cuando la persona realmente decidio mirarlo.
 */
export function PlayableCover({
  youtubeId,
  poster,
  title,
}: {
  youtubeId: string | null;
  poster: string | null;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  if (!youtubeId) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-800">
        <VideoBackdrop youtubeId={null} poster={poster} alt={title} priority />
      </div>
    );
  }

  return (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-800">
        <VideoBackdrop
          youtubeId={youtubeId}
          poster={poster}
          alt={title}
          priority
          siempre
        />

        {/* Velo suave: el video se ve, pero el boton mantiene contraste. */}
        <div aria-hidden="true" className="absolute inset-0 bg-ink/25" />

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Reproducir ${title} con sonido`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-paper/30 bg-ink/40 text-paper backdrop-blur-md transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:border-flame group-hover:bg-flame group-hover:text-ink md:h-24 md:w-24">
            <PlayIcon size={22} weight="fill" />
          </span>
        </button>
      </div>

      <VideoLightbox
        youtubeId={youtubeId}
        open={open}
        onClose={() => setOpen(false)}
        title={title}
      />
    </>
  );
}
