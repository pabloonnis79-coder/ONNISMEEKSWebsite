"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor propio: un punto que va pegado al mouse y un anillo que lo sigue con
 * un poco de retraso. Al pasar por algo que se puede tocar, el anillo crece y
 * se rellena apenas.
 *
 * No hay estado de React en el seguimiento, a proposito. Un puntero dispara
 * decenas de eventos por segundo y cada setState seria un render del arbol
 * entero: se escribe directo sobre el transform del nodo, que el navegador
 * resuelve en el compositor sin recalcular nada.
 *
 * Solo se enciende con un puntero fino. En una pantalla tactil no hay cursor
 * que acompanar, y en una notebook con pantalla tactil y trackpad conviven los
 * dos: por eso se pregunta por "fine" y no por la ausencia de tacto.
 */

/** Lo que se considera tocable y agranda el anillo. */
const INTERACTIVO =
  'a, button, [role="button"], input, select, textarea, summary, label, [tabindex]:not([tabindex="-1"])';

export function CustomCursor() {
  const punto = useRef<HTMLDivElement>(null);
  const anillo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const p = punto.current;
    const a = anillo.current;
    if (!p || !a) return;

    // Sin retraso si pidieron menos movimiento: el anillo va clavado al punto.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seguimiento = reduce ? 1 : 0.18;

    document.documentElement.classList.add("cursor-propio");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ax = x;
    let ay = y;
    let visible = false;
    let cuadro = 0;

    const mover = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;

      if (!visible) {
        visible = true;
        p.style.opacity = "1";
        a.style.opacity = "1";
      }
    };

    const salir = () => {
      visible = false;
      p.style.opacity = "0";
      a.style.opacity = "0";
    };

    const sobre = (e: PointerEvent) => {
      const destino = e.target as Element | null;
      const tocable = Boolean(destino?.closest?.(INTERACTIVO));
      a.classList.toggle("cursor-anillo-activo", tocable);
    };

    const pintar = () => {
      // El punto va exacto; el anillo se acerca una fraccion por cuadro, que es
      // lo que produce el arrastre sin necesidad de ninguna animacion.
      ax += (x - ax) * seguimiento;
      ay += (y - ay) * seguimiento;

      p.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      a.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;

      cuadro = requestAnimationFrame(pintar);
    };

    cuadro = requestAnimationFrame(pintar);
    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerover", sobre, { passive: true });
    document.addEventListener("pointerleave", salir);
    window.addEventListener("blur", salir);

    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerover", sobre);
      document.removeEventListener("pointerleave", salir);
      window.removeEventListener("blur", salir);
      document.documentElement.classList.remove("cursor-propio");
    };
  }, []);

  return (
    <>
      <div ref={anillo} aria-hidden="true" className="cursor-anillo" />
      <div ref={punto} aria-hidden="true" className="cursor-punto" />
    </>
  );
}
