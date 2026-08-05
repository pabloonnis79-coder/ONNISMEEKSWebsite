"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Portada del proyecto. La imagen es lo que carga siempre; el video mudo se
 * monta recien cuando el cursor se queda encima, para no traer seis iframes
 * de YouTube en la primera pantalla.
 */
export function HoverVideo({
  youtubeId,
  poster,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
}: {
  youtubeId: string | null;
  poster: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const canPlay = Boolean(youtubeId) && !reduce;

  function arm() {
    if (!canPlay) return;
    timer.current = setTimeout(() => setPlaying(true), 380);
  }

  function disarm() {
    if (timer.current) clearTimeout(timer.current);
    setPlaying(false);
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-ink-700 ${className ?? ""}`}
      onPointerEnter={arm}
      onPointerLeave={disarm}
    >
      <Image
        src={poster}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
      />

      {playing && youtubeId && (
        <iframe
          title={alt}
          aria-hidden="true"
          tabIndex={-1}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&playsinline=1&rel=0`}
          allow="autoplay; encrypted-media"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        />
      )}
    </div>
  );
}
