"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * En el telefono, el retrato mas cerca del centro de la pantalla queda encendido
 * y el resto en gris.
 *
 * Es el reemplazo del cursor: sin mouse no hay nada que posar, y el efecto de
 * escritorio no llegaria nunca. Lo que en la computadora elige la mano, aca lo
 * elige el scroll.
 *
 * El calculo va en un manejador de scroll con compuerta de cuadro y no en un
 * IntersectionObserver, por lo mismo que en los pasos del proceso: el observador
 * avisa cuando algo entra o sale, no cual de cinco esta mas cerca del centro.
 *
 * La clase que apaga a los demas la pone este componente al arrancar. Si el
 * JavaScript no corre, las cinco fotos quedan en color, que es un resultado
 * correcto; al reves —cinco fotos en gris y ninguna encendida— seria una
 * seccion rota.
 */
export function PortraitFocus({ children }: { children: ReactNode }) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // En escritorio manda el cursor. Las dos cosas juntas se pelearian.
    if (!window.matchMedia("(hover: none)").matches) return;

    const contenedor = caja.current;
    if (!contenedor) return;

    const retratos = [...contenedor.querySelectorAll<HTMLElement>(".retrato")];
    if (retratos.length === 0) return;

    contenedor.classList.add("foco-encendido");

    let cuadro = 0;
    let activo = -1;

    const pintar = () => {
      cuadro = 0;

      const centro = window.innerHeight / 2;
      let cercano = -1;
      let minima = Infinity;

      retratos.forEach((nodo, i) => {
        const r = nodo.getBoundingClientRect();

        // Solo compite lo que esta en pantalla: si la seccion quedo lejos, no
        // tiene sentido dejar uno encendido alla abajo.
        if (r.bottom < 0 || r.top > window.innerHeight) return;

        const distancia = Math.abs(r.top + r.height / 2 - centro);
        if (distancia < minima) {
          minima = distancia;
          cercano = i;
        }
      });

      // Se toca el DOM solo cuando cambia cual esta al frente.
      if (cercano === activo) return;
      activo = cercano;

      retratos.forEach((nodo, i) => {
        nodo.classList.toggle("retrato-activo", i === cercano);
      });
    };

    const alDesplazar = () => {
      if (cuadro) return;
      cuadro = requestAnimationFrame(pintar);
    };

    pintar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar, { passive: true });

    return () => {
      if (cuadro) cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
      contenedor.classList.remove("foco-encendido");
      for (const nodo of retratos) nodo.classList.remove("retrato-activo");
    };
  }, []);

  return <div ref={caja}>{children}</div>;
}
