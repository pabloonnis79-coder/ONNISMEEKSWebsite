"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Fondo de video a sangre completa.
 *
 * La portada carga siempre; el reproductor se monta recien cuando el panel
 * entra en pantalla y se desmonta al salir. Asi nunca hay mas de uno o dos
 * corriendo a la vez, por mas paneles que tenga la pagina. La referencia que
 * tomamos deja los siete cargados desde el principio.
 */
export function VideoBackdrop({
  youtubeId,
  poster,
  alt,
  priority = false,
  siempre = false,
}: {
  youtubeId: string | null;
  poster: string | null;
  alt: string;
  priority?: boolean;
  /**
   * Monta el reproductor sin esperar al observador. Es para el hero, que
   * siempre esta en pantalla al cargar: hacerlo depender de una interseccion
   * que puede no dispararse nunca es arriesgar el elemento mas visible del
   * sitio a cambio de nada.
   */
  siempre?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [enPantalla, setEnPantalla] = useState(false);
  const reduce = useReducedMotion();

  // Con `siempre` no hace falta observador ni estado: el video se muestra y
  // listo. Solo `reduce` puede sacarlo.
  const mostrarVideo = Boolean(youtubeId) && !reduce && (siempre || enPantalla);

  useEffect(() => {
    if (!youtubeId || reduce || siempre) return;

    const nodo = ref.current;
    if (!nodo) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEnPantalla(entry.isIntersecting),
      { rootMargin: "10% 0px", threshold: 0.2 },
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, [youtubeId, reduce, siempre]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-ink-800">
      {poster && (
        <Image
          src={poster}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          quality={90}
          className="object-cover"
        />
      )}

      {mostrarVideo && (
        <iframe
          title=""
          tabIndex={-1}
          aria-hidden="true"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3`}
          allow="autoplay; encrypted-media"
          /*
            Para que un 16:9 cubra la pantalla sin bandas hay que desbordarlo
            por el lado que sobre: alto = ancho * 9/16 y viceversa, y se toma
            el mayor de los dos.
          */
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        />
      )}
    </div>
  );
}
