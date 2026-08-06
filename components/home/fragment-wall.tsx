"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useReducedMotion } from "motion/react";
import type { Project } from "@/lib/types";
import { cn, youtubeThumb } from "@/lib/utils";

/**
 * Muro de fragmentos del hero. Cuatro columnas de trabajos reales que se
 * desplazan a distinta velocidad y en sentidos alternados.
 *
 * Dos piezas corren en video, mudas y en loop. No mas: cada reproductor de
 * YouTube trae su propio JavaScript, y la referencia que tomamos carga siete
 * de golpe. Cuales son esta fijo, no rota: una rotacion por temporizador
 * agregaba estado y remontajes a cambio de muy poco.
 *
 * Es decorativo: no recibe clics ni foco, y el lector de pantalla lo ignora.
 */

const COLUMNAS = [
  { duracion: "52s", sentido: "normal", clase: "", vivo: 1 },
  { duracion: "68s", sentido: "reverse", clase: "hidden sm:block", vivo: 2 },
  { duracion: "44s", sentido: "normal", clase: "hidden lg:block", vivo: -1 },
  { duracion: "60s", sentido: "reverse", clase: "hidden xl:block", vivo: -1 },
] as const;

type Fragmento = { cover: string; alt: string; youtubeId: string | null };

export function FragmentWall({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();

  const columnas = useMemo(() => {
    const fragmentos: Fragmento[] = projects
      .map((p) => ({
        cover: p.coverUrl ?? (p.youtubeId ? youtubeThumb(p.youtubeId) : null),
        alt: p.projectName ?? p.title,
        youtubeId: p.youtubeId,
      }))
      .filter((f): f is Fragmento => Boolean(f.cover));

    if (fragmentos.length === 0) return [];

    return COLUMNAS.map((col, i) => {
      // Cada columna arranca en otro punto de la lista, para no ver la misma
      // portada repetida en columnas contiguas.
      const rotados = fragmentos.map(
        (_, j) => fragmentos[(j + i * 2) % fragmentos.length],
      );
      const base = rotados.length >= 4 ? rotados : [...rotados, ...rotados, ...rotados];
      // La lista va duplicada: correr media altura y volver a cero deja el
      // ciclo sin corte visible.
      return { ...col, items: [...base, ...base] };
    });
  }, [projects]);

  if (columnas.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {columnas.map((col, i) => (
          <div key={i} className={cn("relative overflow-hidden", col.clase)}>
            <div
              className={cn("flex flex-col gap-3", !reduce && "fragment-column")}
              style={
                reduce
                  ? undefined
                  : {
                      animationDuration: col.duracion,
                      animationDirection: col.sentido,
                    }
              }
            >
              {col.items.map((item, j) => {
                const vivo = j === col.vivo && Boolean(item.youtubeId) && !reduce;

                return (
                  <div
                    key={`${item.cover}-${j}`}
                    className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-ink-800"
                  >
                    <Image
                      src={item.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      // Va detras de un velo al 60 por ciento: no necesita mas.
                      quality={75}
                      priority={j < 2}
                      className="object-cover"
                    />

                    {vivo && (
                      <iframe
                        title=""
                        tabIndex={-1}
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${item.youtubeId}&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3`}
                        allow="autoplay; encrypted-media"
                        className="absolute left-1/2 top-1/2 h-[177.77vw] w-[100vw] -translate-x-1/2 -translate-y-1/2 border-0 sm:h-[88.88vw] sm:w-[50vw] lg:h-[59.25vw] lg:w-[33.3vw] xl:h-[44.44vw] xl:w-[25vw]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
