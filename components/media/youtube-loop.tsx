"use client";

import { useEffect, useId, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Video de fondo en loop, mudo y sin nada de YouTube a la vista.
 *
 * El problema: con `controls=0` YouTube igual dibuja su barra de reproduccion
 * en el centro mientras el video esta pausado, y un recorte por los bordes no
 * la tapa. Ademas, si el navegador bloquea la reproduccion automatica, el
 * reproductor se queda quieto justo en ese estado.
 *
 * La solucion: el reproductor arranca invisible y solo se revela cuando la API
 * avisa que efectivamente esta reproduciendo, con un margen para que la barra
 * termine de desaparecer. Si nunca arranca, queda la portada, que es un
 * resultado correcto y no una pantalla con controles encima.
 */

let apiPromise: Promise<any> | null = null;

/** Carga el script de la API una sola vez para toda la pagina. */
function cargarApi(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).YT?.Player) return Promise.resolve((window as any).YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const anterior = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      anterior?.();
      resolve((window as any).YT);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });

  return apiPromise;
}

/** Margen tras el aviso de reproduccion, para que se apague la barra. */
const ESPERA_CHROME_MS = 900;

/** Cada cuanto se le pregunta al reproductor por donde va. */
const PULSO_AVANCE_MS = 250;

export function YoutubeLoop({
  youtubeId,
  className,
  vertical = false,
  onAvance,
}: {
  youtubeId: string;
  className?: string;
  /**
   * Para piezas 9:16. El reproductor pasa a ocupar la caja entera en vez de
   * desbordarse como un 16:9, que en un contenedor vertical dejaria el video
   * como una franja en el medio.
   */
  vertical?: boolean;
  /**
   * Avance de la reproduccion, de 0 a 1. Se informa cuatro veces por segundo,
   * que para dibujar una barra sobra: pedirlo por cuadro seria consultar a un
   * iframe sesenta veces por segundo para mover unos pocos pixeles.
   */
  onAvance?: (fraccion: number) => void;
}) {
  const contenedorId = `yt-${useId().replace(/[:]/g, "")}`;
  const player = useRef<any>(null);
  const revelar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);

  /*
    La devolucion de llamada vive en un ref para que cambiar su identidad entre
    renders no obligue a destruir y recrear el reproductor. Se copia dentro de
    un efecto y no durante el render: escribir un ref mientras se renderiza
    rompe el render concurrente, porque React puede descartar ese intento.
  */
  const avisar = useRef(onAvance);
  useEffect(() => {
    avisar.current = onAvance;
  }, [onAvance]);

  useEffect(() => {
    let vivo = true;
    let pulso: ReturnType<typeof setInterval> | null = null;

    cargarApi().then((YT) => {
      if (!vivo || !YT?.Player) return;
      const nodo = document.getElementById(contenedorId);
      if (!nodo) return;

      player.current = new YT.Player(contenedorId, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          loop: 1,
          playlist: youtubeId,
          playsinline: 1,
          rel: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            // 1 es "reproduciendo" en la API de YouTube.
            if (e.data === 1) {
              if (revelar.current) clearTimeout(revelar.current);
              revelar.current = setTimeout(() => {
                if (vivo) setVisible(true);
              }, ESPERA_CHROME_MS);

              // El pulso arranca recien al reproducir: antes no hay avance que
              // informar y la duracion todavia puede venir en cero.
              if (avisar.current && !pulso) {
                pulso = setInterval(() => {
                  const p = player.current;
                  if (!vivo || !p?.getDuration) return;

                  const total = p.getDuration();
                  if (!total) return;

                  avisar.current?.(Math.min(1, p.getCurrentTime() / total));
                }, PULSO_AVANCE_MS);
              }
            }
          },
        },
      });
    });

    return () => {
      vivo = false;
      if (pulso) clearInterval(pulso);
      if (revelar.current) clearTimeout(revelar.current);
      try {
        player.current?.destroy?.();
      } catch {
        // El nodo ya pudo haberse ido con el desmontaje de React.
      }
      player.current = null;
    };
  }, [youtubeId, contenedorId]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      } ${className ?? ""}`}
    >
      {/*
        En horizontal, el 16:9 se desborda por el lado que sobre para cubrir
        sin bandas. En vertical ocupa la caja entera, porque el material ya
        viene 9:16. El 135% saca de cuadro lo que YouTube dibuja al borde en
        los dos casos.

        Ese 135% va en el tamano y no en un transform: scale agranda lo que el
        reproductor ya dibujo, asi que la imagen llegaba estirada un tercio.
        Pidiendo la caja mas grande, YouTube dibuja esos pixeles de mas y la
        misma porcion de pantalla se ve con un tercio mas de definicion.

        56.25 y 177.78 son 9/16 y 16/9 en porcentaje; por 1.35 dan 75.94 y 240.
      */}
      <div
        id={contenedorId}
        className={
          vertical
            ? "absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 border-0"
            : "absolute left-1/2 top-1/2 h-[75.94vw] min-h-[135%] w-[240vh] min-w-[135%] -translate-x-1/2 -translate-y-1/2 border-0"
        }
      />
    </div>
  );
}
