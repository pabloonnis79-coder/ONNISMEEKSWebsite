"use client";

import { useState } from "react";
import { PlayIcon } from "@phosphor-icons/react";
import { VideoLightbox } from "@/components/media/video-lightbox";

/**
 * Boton de play al centro del panel: abre el mismo video que corre de fondo,
 * esta vez con sonido y a tamano completo.
 *
 * El fondo va mudo porque un video que suena solo al hacer scroll es una
 * molestia; este boton es la forma de escucharlo cuando uno quiere.
 */
export function PanelPlay({
  youtubeId,
  titulo,
}: {
  youtubeId: string;
  titulo: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/*
        El contenedor no captura clics para no tapar el resto del panel; solo
        el boton los recibe. Sin eso, una capa invisible a pantalla completa se
        comeria el clic del enlace "Ver mas".
      */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label={`Reproducir ${titulo} con sonido`}
          className="pointer-events-auto group inline-flex h-16 w-16 items-center justify-center rounded-full border border-paper/30 bg-ink/35 text-paper backdrop-blur-sm transition duration-500 ease-[var(--ease-out-expo)] hover:scale-105 hover:border-flame-warm hover:bg-ink/55 hover:text-flame-warm focus-visible:scale-105 active:scale-95 md:h-20 md:w-20"
        >
          <PlayIcon size={22} weight="fill" className="translate-x-[1px]" />
        </button>
      </div>

      <VideoLightbox
        youtubeId={youtubeId}
        open={abierto}
        onClose={() => setAbierto(false)}
        title={titulo}
      />
    </>
  );
}
