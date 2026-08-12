"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Envoltorio magnetico: lo que tiene adentro se corre hacia el cursor mientras
 * el cursor esta encima, y vuelve a su lugar al salir.
 *
 * El desplazamiento es una fraccion de la distancia al centro, no un valor
 * fijo: asi el boton se inclina hacia el lado del que uno viene y el efecto se
 * lee como atraccion y no como un salto.
 *
 * Solo con puntero fino. En una pantalla tactil no hay nada que seguir: el
 * dedo aparece sobre el boton y desaparece, y el unico resultado seria que el
 * boton se corra justo cuando lo estan por tocar.
 */
export function Magnetic({
  children,
  className,
  factor = 0.28,
}: {
  children: React.ReactNode;
  className?: string;
  /** Cuanto del camino al cursor recorre el boton. */
  factor?: number;
}) {
  const caja = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nodo = caja.current;
    if (!nodo) return;

    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cuadro = 0;
    let x = 0;
    let y = 0;

    const mover = (e: PointerEvent) => {
      const r = nodo.getBoundingClientRect();
      x = (e.clientX - (r.left + r.width / 2)) * factor;
      y = (e.clientY - (r.top + r.height / 2)) * factor;

      // Una escritura por cuadro: el puntero informa mas seguido que eso.
      if (cuadro) return;
      cuadro = requestAnimationFrame(() => {
        cuadro = 0;
        nodo.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
    };

    const entrar = () => {
      // Al seguir al cursor la transicion es corta, para que no vaya arrastrado.
      nodo.style.transition = "transform 160ms cubic-bezier(0.33, 1, 0.68, 1)";
    };

    const salir = () => {
      if (cuadro) {
        cancelAnimationFrame(cuadro);
        cuadro = 0;
      }
      // Al soltar, mas larga y con rebote: es la parte que se disfruta.
      nodo.style.transition = "transform 520ms var(--ease-out-expo)";
      nodo.style.transform = "translate3d(0, 0, 0)";
    };

    nodo.addEventListener("pointerenter", entrar);
    nodo.addEventListener("pointermove", mover);
    nodo.addEventListener("pointerleave", salir);

    return () => {
      if (cuadro) cancelAnimationFrame(cuadro);
      nodo.removeEventListener("pointerenter", entrar);
      nodo.removeEventListener("pointermove", mover);
      nodo.removeEventListener("pointerleave", salir);
      nodo.style.transform = "";
      nodo.style.transition = "";
    };
  }, [factor]);

  return (
    <span ref={caja} className={cn("inline-flex will-change-transform", className)}>
      {children}
    </span>
  );
}
