"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";

export type FotoAmpliada = { url: string; alt: string };

/**
 * Visor de fotos a pantalla completa.
 *
 * Recorre la lista entera, no la del bloque de donde se abrio: para quien mira,
 * "la foto siguiente" es la que sigue, no la que sigue dentro de la categoria.
 *
 * Se navega con las flechas del teclado, con los botones, y arrastrando el dedo
 * en el telefono. Tres formas para el mismo gesto, porque en cada aparato uno
 * intenta una distinta.
 */

/** Cuanto hay que arrastrar para que cuente como pasar de foto. */
const ARRASTRE_MINIMO = 60;

export function PhotoLightbox({
  fotos,
  indice,
  onCerrar,
  onIr,
}: {
  fotos: FotoAmpliada[];
  /** null con el visor cerrado. */
  indice: number | null;
  onCerrar: () => void;
  onIr: (nuevo: number) => void;
}) {
  const abierto = indice !== null;
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const arrastreX = useRef<number | null>(null);

  const anterior = useCallback(() => {
    if (indice === null) return;
    onIr((indice - 1 + fotos.length) % fotos.length);
  }, [indice, fotos.length, onIr]);

  const siguiente = useCallback(() => {
    if (indice === null) return;
    onIr((indice + 1) % fotos.length);
  }, [indice, fotos.length, onIr]);

  useEffect(() => {
    if (!abierto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // El foco se lleva al boton de cerrar: con el visor abierto, seguir tabulando
    // por la pagina de atras deja a quien navega con teclado perdido.
    cerrarRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierto, onCerrar, anterior, siguiente]);

  const foto = indice === null ? null : fotos[indice];

  /*
    Sin AnimatePresence a proposito, y no por simplificar.

    Con AnimatePresence el nodo se saca del DOM recien cuando termina la
    animacion de salida. Si esa animacion no corre —y se vio no corriendo—, el
    visor queda pegado a pantalla completa tapando todo, con el scroll ya
    devuelto: la pagina sigue viva abajo pero no se puede tocar nada.

    Una capa que cubre la pantalla entera no puede depender de que una animacion
    termine para desaparecer. La entrada si se anima, que es donde se nota.
  */
  return (
    <>
      {abierto && foto && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${indice + 1} de ${fotos.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-ink/97 backdrop-blur-sm"
          onClick={onCerrar}
          onPointerDown={(e) => {
            arrastreX.current = e.clientX;
          }}
          onPointerUp={(e) => {
            const desde = arrastreX.current;
            arrastreX.current = null;
            if (desde === null) return;

            const delta = e.clientX - desde;
            if (Math.abs(delta) < ARRASTRE_MINIMO) return;
            // Arrastrar hacia la izquierda trae la siguiente, como en cualquier
            // galeria de telefono.
            if (delta < 0) siguiente();
            else anterior();
          }}
        >
          <div className="flex shrink-0 items-center justify-between px-5 py-4 md:px-8 md:py-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-paper-faint">
              {indice + 1} / {fotos.length}
            </span>

            <button
              ref={cerrarRef}
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
            >
              <XIcon size={18} weight="bold" />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-6 md:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/*
              La clave está en la key: al cambiarla, React reemplaza el nodo y
              Motion puede animar la entrada de cada foto. Sin eso sería la
              misma imagen cambiando de src, sin transición posible.
            */}
            <motion.div
              key={foto.url}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full w-full"
            >
              <Image
                src={foto.url}
                alt={foto.alt}
                fill
                sizes="100vw"
                quality={92}
                className="object-contain"
                priority
              />
            </motion.div>

            {fotos.length > 1 && (
              <>
                <Flecha lado="izq" onClick={anterior} />
                <Flecha lado="der" onClick={siguiente} />
              </>
            )}
          </div>

          <p className="shrink-0 px-5 pb-6 text-center text-sm text-paper-dim md:px-8">
            {foto.alt}
          </p>
        </motion.div>
      )}
    </>
  );
}

function Flecha({ lado, onClick }: { lado: "izq" | "der"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={lado === "izq" ? "Foto anterior" : "Foto siguiente"}
      className={`absolute top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/60 text-paper backdrop-blur-sm transition-colors hover:border-flame-warm hover:text-flame-warm ${
        lado === "izq" ? "left-2 md:left-6" : "right-2 md:right-6"
      }`}
    >
      {lado === "izq" ? (
        <CaretLeftIcon size={18} weight="bold" />
      ) : (
        <CaretRightIcon size={18} weight="bold" />
      )}
    </button>
  );
}
