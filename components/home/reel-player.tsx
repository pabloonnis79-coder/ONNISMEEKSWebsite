"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowsInIcon,
  ArrowsOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { Reel } from "@/lib/db/settings";

/**
 * Visor de reels a pantalla completa, con sonido.
 *
 * En la tira de la portada los reels van mudos y en loop, que es una vitrina.
 * Esto es lo otro: alguien eligio uno y lo quiere ver. Arranca con sonido
 * —permitido, porque viene de un toque— y con los controles de YouTube a la
 * vista, para poder pausar y buscar.
 *
 * Se pasa de uno a otro con las flechas del teclado, con los botones y
 * arrastrando el dedo. Tres formas para el mismo gesto, porque en cada aparato
 * uno intenta una distinta.
 */

/** Cuanto hay que arrastrar para que cuente como pasar de reel. */
const ARRASTRE_MINIMO = 60;

/**
 * En el telefono la capa ya ocupa la pantalla entera y pedir pantalla completa
 * de verdad no cambia casi nada; ademas iOS no la da para un elemento que no
 * sea un video. En escritorio si vale: saca la barra del navegador. Por eso el
 * boton aparece solo cuando el navegador lo permite.
 */
function sePuedeAmpliar(nodo: HTMLElement | null): boolean {
  return Boolean(nodo && typeof nodo.requestFullscreen === "function");
}

export function ReelPlayer({
  reels,
  indice,
  onCerrar,
  onIr,
}: {
  reels: Reel[];
  /** null con el visor cerrado. */
  indice: number | null;
  onCerrar: () => void;
  onIr: (nuevo: number) => void;
}) {
  const abierto = indice !== null;
  const capa = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const arrastreX = useRef<number | null>(null);
  const [ampliado, setAmpliado] = useState(false);
  const [sePuede, setSePuede] = useState(false);

  const anterior = useCallback(() => {
    if (indice === null) return;
    onIr((indice - 1 + reels.length) % reels.length);
  }, [indice, reels.length, onIr]);

  const siguiente = useCallback(() => {
    if (indice === null) return;
    onIr((indice + 1) % reels.length);
  }, [indice, reels.length, onIr]);

  const alternarAmpliado = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void capa.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    if (!abierto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
    };

    /*
      La pantalla completa se puede soltar desde afuera —con Escape, o con el
      boton del navegador— y el icono tiene que enterarse. Preguntarle al
      documento es lo unico confiable: nuestro boton no es la unica forma.
    */
    const onCambio = () => setAmpliado(Boolean(document.fullscreenElement));

    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onCambio);
    document.body.style.overflow = "hidden";
    setSePuede(sePuedeAmpliar(capa.current));
    // Con el visor abierto, seguir tabulando por la pagina de atras deja a
    // quien navega con teclado perdido.
    cerrarRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onCambio);
      document.body.style.overflow = "";
      // Cerrar el visor tiene que devolver la pantalla, o el navegador queda
      // ampliado mostrando la pagina de atras.
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, [abierto, onCerrar, anterior, siguiente]);

  const reel = indice === null ? null : reels[indice];

  /*
    Sin AnimatePresence a proposito, y no por simplificar: con AnimatePresence
    el nodo se saca del DOM recien cuando termina la animacion de salida, y si
    esa animacion no corre —ya paso en el visor de fotos— la capa queda pegada
    tapando todo, con el scroll ya devuelto. Una capa que cubre la pantalla
    entera no puede depender de que una animacion termine para desaparecer.
  */
  return (
    <>
      {abierto && reel && (
        <motion.div
          ref={capa}
          role="dialog"
          aria-modal="true"
          aria-label={reel.titulo || `Reel ${indice + 1} de ${reels.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-ink"
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
            if (delta < 0) siguiente();
            else anterior();
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-4 md:px-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-paper-faint">
              {indice + 1} / {reels.length}
            </span>

            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {sePuede && (
                <button
                  type="button"
                  onClick={alternarAmpliado}
                  aria-label={ampliado ? "Salir de pantalla completa" : "Pantalla completa"}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
                >
                  {ampliado ? (
                    <ArrowsInIcon size={18} weight="bold" />
                  ) : (
                    <ArrowsOutIcon size={18} weight="bold" />
                  )}
                </button>
              )}

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
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-4 md:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/*
              La pieza es 9:16 y manda el alto: en escritorio la pantalla sobra
              a lo ancho y falta a lo alto, asi que se calcula el ancho desde el
              alto disponible. Al reves, el reel se saldria por abajo.
            */}
            <div className="relative h-full max-h-full w-auto" style={{ aspectRatio: "9 / 16" }}>
              {/*
                La key fuerza un iframe nuevo por reel. Sin eso, cambiar la
                direccion del mismo iframe deja al reproductor anterior sonando
                unos instantes encima del siguiente.
              */}
              <iframe
                key={reel.youtubeId}
                src={`https://www.youtube-nocookie.com/embed/${reel.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                title={reel.titulo || "Reel"}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0 bg-ink-800"
              />
            </div>

            {reels.length > 1 && (
              <>
                <Flecha lado="izq" onClick={anterior} />
                <Flecha lado="der" onClick={siguiente} />
              </>
            )}
          </div>

          {(reel.titulo || reel.cliente) && (
            <div className="shrink-0 px-5 pb-6 text-center md:px-8">
              {reel.titulo && (
                <p className="font-display text-base font-extrabold uppercase tracking-[-0.03em] text-paper">
                  {reel.titulo}
                </p>
              )}
              {reel.cliente && (
                <p className="mt-1 text-[13px] text-paper-dim">{reel.cliente}</p>
              )}
            </div>
          )}
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
      aria-label={lado === "izq" ? "Reel anterior" : "Reel siguiente"}
      className={`absolute top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/60 text-paper backdrop-blur-sm transition-colors hover:border-flame-warm hover:text-flame-warm ${
        lado === "izq" ? "left-1 md:left-6" : "right-1 md:right-6"
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
