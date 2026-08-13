"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { YoutubeLoop } from "@/components/media/youtube-loop";

/**
 * Fondo de video a sangre completa.
 *
 * Si hay un MP4 propio cargado desde el panel, gana: es un archivo servido
 * directo, sin reproductor de terceros encima. No hay controles que esconder ni
 * script que esperar, y arranca antes. Para un fondo en bucle es lo mas limpio
 * que existe.
 *
 * Sin MP4 se cae a YouTube. Ahi la portada carga siempre y queda debajo: el
 * video aparece por encima recien cuando esta reproduciendo de verdad, para que
 * nunca se vea la barra de controles que YouTube dibuja mientras esta pausado.
 *
 * En los dos casos el reproductor se monta al entrar en pantalla y se desmonta
 * al salir, para que no haya mas de uno o dos corriendo por mas paneles que
 * tenga la pagina.
 */
export function VideoBackdrop({
  youtubeId,
  mp4 = null,
  poster,
  alt,
  priority = false,
  siempre = false,
}: {
  youtubeId: string | null;
  /** Archivo propio. Si esta, se usa en lugar de YouTube. */
  mp4?: string | null;
  poster: string | null;
  alt: string;
  priority?: boolean;
  /** Monta el reproductor sin esperar al observador, para el hero. */
  siempre?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [enPantalla, setEnPantalla] = useState(false);
  const [corriendo, setCorriendo] = useState(false);
  const reduce = useReducedMotion();

  const hayAlgo = Boolean(mp4 || youtubeId);
  const mostrar = hayAlgo && !reduce && (siempre || enPantalla);

  useEffect(() => {
    if (!hayAlgo || reduce || siempre) return;

    const nodo = ref.current;
    if (!nodo) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEnPantalla(entry.isIntersecting),
      { rootMargin: "10% 0px", threshold: 0.2 },
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, [hayAlgo, reduce, siempre]);

  /*
    El video propio se pausa al salir de pantalla. Sin esto, un panel que quedo
    arriba sigue decodificando cuadros que nadie mira, y con varios paneles eso
    se nota en el ventilador de la maquina.
  */
  useEffect(() => {
    const nodo = video.current;
    if (!nodo) return;

    if (mostrar) void nodo.play().catch(() => {});
    else nodo.pause();
  }, [mostrar]);

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

      {mostrar && mp4 && (
        /*
          Aparece recien cuando ya esta dibujando cuadros. Un video que todavia
          esta buscando el primero se ve negro, y sobre la portada eso es un
          parpadeo.
        */
        <video
          ref={video}
          key={mp4}
          src={mp4}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlaying={() => setCorriendo(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            corriendo ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* La clave fuerza un reproductor nuevo si cambia el video, asi el
          revelado vuelve a empezar en vez de mostrar el anterior. */}
      {mostrar && !mp4 && youtubeId && (
        <YoutubeLoop key={youtubeId} youtubeId={youtubeId} />
      )}
    </div>
  );
}
