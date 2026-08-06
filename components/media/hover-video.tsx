"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Portada de un proyecto.
 *
 * La imagen carga siempre. El video se monta al pasar el cursor y, si se pide
 * `auto`, tambien cuando la tarjeta esta bien a la vista. El umbral es alto a
 * proposito: asi solo corren las que el visitante realmente esta mirando, una
 * o dos a la vez, y no toda la grilla.
 */
export function HoverVideo({
  youtubeId,
  poster,
  alt,
  priority = false,
  auto = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
}: {
  youtubeId: string | null;
  poster: string | null;
  alt: string;
  priority?: boolean;
  auto?: boolean;
  sizes?: string;
  className?: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hover, setHover] = useState(false);
  const [aLaVista, setALaVista] = useState(false);
  const reduce = useReducedMotion();

  const puedeReproducir = Boolean(youtubeId) && !reduce;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!auto || !puedeReproducir) return;

    const nodo = contenedor.current;
    if (!nodo) return;

    const observer = new IntersectionObserver(
      ([entry]) => setALaVista(entry.isIntersecting),
      { threshold: 0.35 },
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, [auto, puedeReproducir]);

  function armar() {
    if (!puedeReproducir) return;
    timer.current = setTimeout(() => setHover(true), 320);
  }

  function desarmar() {
    if (timer.current) clearTimeout(timer.current);
    setHover(false);
  }

  const mostrarVideo = puedeReproducir && (hover || aLaVista);

  return (
    <div
      ref={contenedor}
      className={`relative h-full w-full overflow-hidden bg-ink-800 ${className ?? ""}`}
      onPointerEnter={armar}
      onPointerLeave={desarmar}
    >
      {poster ? (
        <Image
          src={poster}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          quality={90}
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-ink-800">
          <span className="font-display text-sm font-extrabold uppercase tracking-[0.2em] text-paper-faint">
            Sin portada
          </span>
        </div>
      )}

      {mostrarVideo && youtubeId && (
        <iframe
          title=""
          aria-hidden="true"
          tabIndex={-1}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3`}
          allow="autoplay; encrypted-media"
          /* El scale saca de cuadro la barra de titulo y el logo de YouTube,
             que aparecen igual con controls=0 y no se pueden apagar. */
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0"
        />
      )}
    </div>
  );
}
