"use client";

import { useEffect, useRef } from "react";

/**
 * Barra de progreso de lectura: una linea al borde izquierdo que crece a
 * medida que se baja por la pagina.
 *
 * Se dibuja siempre con la altura completa y se la escala verticalmente, en
 * lugar de cambiarle el alto. Cambiar el alto obliga al navegador a recalcular
 * el layout en cada cuadro; una escala la resuelve el compositor, igual que el
 * cursor.
 *
 * Tampoco hay estado de React acá, y por lo mismo: el scroll dispara eventos a
 * la velocidad del dedo y cada uno seria un render.
 */
export function ScrollProgress() {
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodo = barra.current;
    if (!nodo) return;

    let pendiente = false;

    const pintar = () => {
      pendiente = false;

      const doc = document.documentElement;
      const recorrido = doc.scrollHeight - doc.clientHeight;

      // Una pagina que entra entera en pantalla no tiene progreso que mostrar.
      if (recorrido <= 0) {
        nodo.style.transform = "scaleY(0)";
        return;
      }

      const avance = Math.min(1, Math.max(0, window.scrollY / recorrido));
      nodo.style.transform = `scaleY(${avance})`;
    };

    /*
      El evento de scroll llega mas seguido que los cuadros de pantalla. Sin
      esta compuerta se calcularia varias veces para dibujar una sola.
    */
    const alDesplazar = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(pintar);
    };

    pintar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar, { passive: true });

    return () => {
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
    };
  }, []);

  return (
    <div className="progreso-riel" aria-hidden="true">
      <div ref={barra} className="progreso-barra" />
    </div>
  );
}
