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

export function YoutubeLoop({
  youtubeId,
  className,
}: {
  youtubeId: string;
  className?: string;
}) {
  const contenedorId = `yt-${useId().replace(/[:]/g, "")}`;
  const player = useRef<any>(null);
  const revelar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let vivo = true;

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
            }
          },
        },
      });
    });

    return () => {
      vivo = false;
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
        El 16:9 se desborda por el lado que sobre para cubrir sin bandas, y el
        scale extra saca de cuadro cualquier resto que YouTube dibuje al borde.
      */}
      <div
        id={contenedorId}
        className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0"
      />
    </div>
  );
}
