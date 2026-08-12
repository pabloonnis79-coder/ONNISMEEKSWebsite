"use client";

import { useCallback, useRef } from "react";
import { PlayIcon } from "@phosphor-icons/react";
import { HoverVideo } from "@/components/media/hover-video";

/**
 * Portada del proyecto con los adornos de un reproductor encima: el boton de
 * play, la duracion y una barra de avance.
 *
 * La duracion es la real del video, la que informa YouTube y que ya viene
 * guardada con el proyecto. La barra tambien es real: la mueve el reproductor
 * mientras la portada se reproduce al pasar el cursor. Ninguna de las dos esta
 * simulada, y no hacia falta que lo estuvieran: los dos datos ya existian.
 */
export function CoverPlayer({
  youtubeId,
  poster,
  alt,
  duracion,
  priority = false,
  auto = false,
  sizes,
}: {
  youtubeId: string | null;
  poster: string | null;
  alt: string;
  /** Ya formateada, del tipo "1:20". */
  duracion: string;
  priority?: boolean;
  auto?: boolean;
  sizes?: string;
}) {
  const barra = useRef<HTMLDivElement>(null);

  const dibujarAvance = useCallback((fraccion: number) => {
    const nodo = barra.current;
    if (nodo) nodo.style.transform = `scaleX(${fraccion})`;
  }, []);

  return (
    <>
      <HoverVideo
        youtubeId={youtubeId}
        poster={poster}
        alt={alt}
        priority={priority}
        auto={auto}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        onAvance={dibujarAvance}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
      />

      {youtubeId && (
        <>
          {/*
            El circulo aparece al pasar el cursor. Quieto en todas las tarjetas
            a la vez seria un muro de botones compitiendo con las imagenes.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-4 inline-flex h-11 w-11 translate-y-1 items-center justify-center rounded-full border border-paper/25 bg-ink/45 text-paper opacity-0 backdrop-blur-sm transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100"
          >
            <PlayIcon size={15} weight="fill" />
          </span>

          {duracion && (
            <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[10px] tabular-nums text-paper opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
              {duracion}
            </span>
          )}
        </>
      )}

      {/* Riel de avance al pie de la portada. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-paper/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <span
          ref={barra}
          className="block h-full w-full origin-left scale-x-0 flame-bg"
        />
      </span>
    </>
  );
}
