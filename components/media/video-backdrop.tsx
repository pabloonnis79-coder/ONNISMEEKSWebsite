"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { YoutubeLoop } from "@/components/media/youtube-loop";

/**
 * Fondo de video a sangre completa.
 *
 * La portada carga siempre y queda debajo: el video aparece por encima recien
 * cuando esta reproduciendo de verdad. Asi nunca se ve la barra de controles
 * que YouTube dibuja mientras esta pausado.
 *
 * El reproductor se monta al entrar en pantalla y se desmonta al salir, para
 * que no haya mas de uno o dos corriendo por mas paneles que tenga la pagina.
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
  /** Monta el reproductor sin esperar al observador, para el hero. */
  siempre?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [enPantalla, setEnPantalla] = useState(false);
  const reduce = useReducedMotion();

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

      {/* La clave fuerza un reproductor nuevo si cambia el video, asi el
          revelado vuelve a empezar en vez de mostrar el anterior. */}
      {mostrarVideo && youtubeId && (
        <YoutubeLoop key={youtubeId} youtubeId={youtubeId} />
      )}
    </div>
  );
}
