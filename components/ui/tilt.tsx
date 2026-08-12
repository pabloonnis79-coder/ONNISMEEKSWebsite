"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Inclinacion en tres dimensiones segun donde este el cursor sobre la caja.
 *
 * El eje esta cruzado a proposito: el cursor arriba inclina el borde de arriba
 * hacia atras, no hacia adelante. Es como se comporta una superficie real
 * apoyada sobre un punto, y al reves se siente mal sin que uno sepa por que.
 *
 * Solo con puntero fino, y quieto con prefers-reduced-motion.
 */
export function Tilt({
  children,
  className,
  grados = 6,
}: {
  children: React.ReactNode;
  className?: string;
  /** Inclinacion maxima, en los bordes de la caja. */
  grados?: number;
}) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodo = caja.current;
    if (!nodo) return;

    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cuadro = 0;
    let rx = 0;
    let ry = 0;

    const mover = (e: PointerEvent) => {
      const r = nodo.getBoundingClientRect();
      // De -0,5 a 0,5 desde el centro de la caja.
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      rx = -py * grados * 2;
      ry = px * grados * 2;

      if (cuadro) return;
      cuadro = requestAnimationFrame(() => {
        cuadro = 0;
        nodo.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      });
    };

    const entrar = () => {
      nodo.style.transition = "transform 180ms cubic-bezier(0.33, 1, 0.68, 1)";
    };

    const salir = () => {
      if (cuadro) {
        cancelAnimationFrame(cuadro);
        cuadro = 0;
      }
      nodo.style.transition = "transform 620ms var(--ease-out-expo)";
      nodo.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
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
  }, [grados]);

  return (
    <div ref={caja} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
