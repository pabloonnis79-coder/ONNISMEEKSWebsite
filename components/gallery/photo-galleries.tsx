"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { PhotoLightbox, type FotoAmpliada } from "@/components/gallery/photo-lightbox";
import type { GaleriaFoto } from "@/lib/db/settings";

/**
 * Galerias de fotografia agrupadas por categoria, como en la pagina de
 * produccion fotografica de la referencia.
 *
 * El alto de cada fila alterna para que la grilla no quede como una planilla:
 * la primera de cada bloque va apaisada y grande, el resto en cuadrado.
 *
 * Al tocar una foto se abre a pantalla completa y desde ahi se recorren todas
 * las de la pagina, no solo las del bloque: para quien mira, la foto siguiente
 * es la que sigue, no la que sigue dentro de la categoria.
 */
export function PhotoGalleries({ galerias }: { galerias: GaleriaFoto[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);

  if (galerias.length === 0) return null;

  /*
    Una sola lista con todas las fotos, y el indice global de cada una. Es lo
    que permite pasar de la ultima de un bloque a la primera del siguiente sin
    que el visor se entere de que cambio de categoria.
  */
  const todas: FotoAmpliada[] = [];
  const indices = galerias.map((galeria) =>
    galeria.fotos.map((foto, i) => {
      todas.push({ url: foto, alt: `${galeria.titulo}, foto ${i + 1}` });
      return todas.length - 1;
    }),
  );

  return (
    <>
      {galerias.map((galeria, g) => (
        <section
          key={galeria.titulo}
          className="mx-auto max-w-[1600px] border-t border-line px-5 py-16 md:px-10 md:py-24"
        >
          <h2 className="display font-display text-[10vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6.5vw] lg:text-[min(4vw,64px)]">
            {galeria.titulo}
          </h2>

          <ul className="mt-10 grid grid-cols-2 gap-2 md:mt-14 md:grid-cols-4 md:gap-3">
            {galeria.fotos.map((foto, i) => {
              // La primera de cada bloque ocupa el doble, para romper la grilla.
              const destacada = i === 0;
              const indiceGlobal = indices[g][i];

              return (
                <li
                  key={`${foto}-${i}`}
                  className={destacada ? "col-span-2 row-span-2" : ""}
                >
                  <Reveal delay={(i % 4) * 0.05}>
                    {/*
                      Es un boton y no un div con onClick: asi se llega con el
                      teclado y los lectores de pantalla lo anuncian como algo
                      que se puede accionar.
                    */}
                    <button
                      type="button"
                      onClick={() => setAbierta(indiceGlobal)}
                      aria-label={`Ampliar ${galeria.titulo}, foto ${i + 1}`}
                      className="group relative block w-full cursor-pointer overflow-hidden bg-ink-800 aspect-square"
                    >
                      <Image
                        src={foto}
                        alt={`${galeria.titulo}, foto ${i + 1}`}
                        fill
                        sizes={
                          destacada
                            ? "(max-width: 768px) 100vw, 50vw"
                            : "(max-width: 768px) 50vw, 25vw"
                        }
                        quality={90}
                        priority={g === 0 && i === 0}
                        className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                      />
                    </button>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <PhotoLightbox
        fotos={todas}
        indice={abierta}
        onCerrar={() => setAbierta(null)}
        onIr={setAbierta}
      />
    </>
  );
}
