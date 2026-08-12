"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { YoutubeLoop } from "@/components/media/youtube-loop";
import type { Reel } from "@/lib/db/settings";
import { formatDuration, youtubeThumb } from "@/lib/utils";

/**
 * Reels verticales, en 9:16, como se publican en Instagram.
 *
 * Van en una tira horizontal con scroll nativo: se recorre con la rueda, el
 * trackpad, el dedo o el teclado, sin secuestrar el scroll de la pagina. Cada
 * pieza arranca sola al entrar en cuadro y se apaga al salir, asi nunca hay
 * mas de uno o dos reproductores corriendo.
 */
export function Reels({ reels }: { reels: Reel[] }) {
  if (reels.length === 0) return null;

  return (
    <section
      aria-label="Reels"
      className="border-t border-line bg-ink-800 py-16 md:py-24"
    >
      <div className="mx-auto mb-10 max-w-[1600px] px-5 md:mb-14 md:px-10">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Formato vertical
        </p>
        <h2 className="display max-w-[16ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[7vw] lg:text-[min(4.4vw,70.4px)]">
          Piezas para redes
        </h2>
      </div>

      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 md:gap-6 md:px-10 [scrollbar-width:thin]">
        {reels.map((reel, i) => (
          <li
            key={`${reel.youtubeId}-${i}`}
            className="w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-[26vw] xl:w-[20vw]"
          >
            <ReelCard reel={reel} priority={i < 2} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReelCard({ reel, priority }: { reel: Reel; priority: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const [enPantalla, setEnPantalla] = useState(false);
  const reduce = useReducedMotion();

  /*
    El avance se escribe directo sobre el transform de la barra. Guardarlo en
    estado seria volver a renderizar la tarjeta cuatro veces por segundo, con
    la imagen y el reproductor adentro, para mover una linea de dos pixeles.
  */
  const dibujarAvance = useCallback((fraccion: number) => {
    const nodo = barra.current;
    if (nodo) nodo.style.transform = `scaleX(${fraccion})`;
  }, []);

  useEffect(() => {
    if (reduce) return;
    const nodo = ref.current;
    if (!nodo) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEnPantalla(entry.isIntersecting),
      { threshold: 0.4 },
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <figure>
      <div
        ref={ref}
        className="relative aspect-[9/16] w-full overflow-hidden bg-ink-700"
      >
        <Image
          src={youtubeThumb(reel.youtubeId)}
          alt={reel.titulo || "Reel"}
          fill
          priority={priority}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 42vw, 26vw"
          quality={90}
          className="object-cover"
        />

        {enPantalla && (
          <YoutubeLoop
            key={reel.youtubeId}
            youtubeId={reel.youtubeId}
            vertical
            onAvance={dibujarAvance}
          />
        )}

        {/* Velo de abajo: sin esto, la insignia se pierde sobre un plano claro. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/85 to-transparent"
        />

        {reel.duracion ? (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10px] tabular-nums text-paper backdrop-blur-sm">
            {formatDuration(reel.duracion)}
          </span>
        ) : null}

        {/* Barra de avance, pegada al borde inferior. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-paper/15"
        >
          <div
            ref={barra}
            className="h-full w-full origin-left scale-x-0 flame-bg"
          />
        </div>
      </div>

      {(reel.titulo || reel.cliente) && (
        <figcaption className="pt-3.5">
          {reel.titulo && (
            <p className="font-display text-base font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-paper md:text-lg">
              {reel.titulo}
            </p>
          )}
          {reel.cliente && (
            <p className="mt-1.5 text-[13px] text-paper-dim">{reel.cliente}</p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
