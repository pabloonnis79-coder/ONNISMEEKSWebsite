"use client";

import { useEffect, useRef } from "react";

/**
 * Resplandor cálido detrás del manifiesto, que se corre apenas con el scroll.
 *
 * El desplazamiento es chico a propósito: lo que da la sensación de profundidad
 * no es cuánto se mueve, sino que se mueva a distinta velocidad que el texto.
 * Con mucho recorrido deja de leerse como fondo y empieza a competir.
 *
 * Sin estado de React y con una compuerta de cuadro, igual que la barra de
 * progreso: el scroll dispara mas seguido de lo que la pantalla dibuja.
 *
 * Solo calcula mientras la sección está a la vista. Un resplandor que nadie
 * puede ver no merece un cálculo por cuadro.
 */

/** Cuánto se corre, de un extremo al otro del recorrido. */
const AMPLITUD = 44;

export function ManifestoGlow() {
  const halo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodo = halo.current;
    const seccion = nodo?.parentElement;
    if (!nodo || !seccion) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    let pendiente = false;

    const pintar = () => {
      pendiente = false;

      const caja = seccion.getBoundingClientRect();
      const alto = window.innerHeight;

      /*
       * Cuánto avanzó la sección al cruzar la pantalla, de -1 cuando todavía
       * viene subiendo a 1 cuando ya se fue por arriba. En el medio, 0.
       */
      const centroSeccion = caja.top + caja.height / 2;
      const avance = (alto / 2 - centroSeccion) / (alto / 2 + caja.height / 2);
      const acotado = Math.max(-1, Math.min(1, avance));

      nodo.style.transform = `translate3d(0, ${(acotado * AMPLITUD).toFixed(1)}px, 0)`;
    };

    const alDesplazar = () => {
      if (pendiente || !visible) return;
      pendiente = true;
      requestAnimationFrame(pintar);
    };

    const observer = new IntersectionObserver(
      ([entrada]) => {
        visible = entrada.isIntersecting;
        if (visible) pintar();
      },
      // Un margen para que empiece a acomodarse antes de entrar del todo.
      { rootMargin: "200px 0px" },
    );

    observer.observe(seccion);
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
    };
  }, []);

  return <div ref={halo} className="manifiesto-halo" aria-hidden="true" />;
}
