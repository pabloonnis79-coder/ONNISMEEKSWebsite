"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useReducedMotion } from "motion/react";
import type { Project } from "@/lib/types";
import { cn, youtubeThumb } from "@/lib/utils";

/**
 * Muro de fragmentos en movimiento. Columnas de portadas reales que se
 * desplazan a distinta velocidad y en sentidos alternados.
 *
 * Va detras del titular, asi que es decorativo: no recibe clics ni foco, y el
 * lector de pantalla lo ignora. El movimiento es una sola transformacion por
 * columna, de las que resuelve la placa de video, no hay JavaScript por cuadro.
 */

const COLUMNAS = [
  { duracion: "52s", sentido: "normal", clase: "" },
  { duracion: "68s", sentido: "reverse", clase: "hidden sm:block" },
  { duracion: "44s", sentido: "normal", clase: "hidden lg:block" },
  { duracion: "60s", sentido: "reverse", clase: "hidden xl:block" },
] as const;

type Fragmento = { cover: string; alt: string };

export function FragmentWall({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();

  const columnas = useMemo(() => {
    const fragmentos: Fragmento[] = projects
      .map((p) => ({
        cover: p.coverUrl ?? (p.youtubeId ? youtubeThumb(p.youtubeId) : null),
        alt: p.projectName ?? p.title,
      }))
      .filter((f): f is Fragmento => Boolean(f.cover));

    if (fragmentos.length === 0) return [];

    // Cada columna arranca en un punto distinto de la lista, para que no se
    // vean cuatro veces la misma portada en fila.
    return COLUMNAS.map((col, i) => {
      const rotados = fragmentos.map(
        (_, j) => fragmentos[(j + i * 2) % fragmentos.length],
      );
      // Se repite la lista hasta tener material suficiente y se duplica al
      // final, que es lo que hace que el loop no tenga corte visible.
      const base = rotados.length >= 4 ? rotados : [...rotados, ...rotados, ...rotados];
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
              {col.items.map((item, j) => (
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
