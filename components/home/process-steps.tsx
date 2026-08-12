"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/reveal";

/**
 * Los tres pasos, con el que esta mas cerca del centro de la pantalla a plena
 * opacidad y el resto atenuados.
 *
 * El calculo va en un manejador de scroll con compuerta de cuadro y no con un
 * IntersectionObserver: el observador avisa cuando algo entra o sale, no cual
 * de tres esta mas cerca del centro. Para saber eso harian falta muchisimos
 * umbrales y aun asi la respuesta llegaria a saltos.
 *
 * En el HTML del servidor los tres salen a opacidad plena. Si el JavaScript no
 * corre, se leen los tres enteros en vez de quedar dos apagados para siempre.
 */

const ATENUADO = "0.35";

export function ProcessSteps({
  steps,
}: {
  steps: Array<{ verb: string; body: string }>;
}) {
  const cajas = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Se copia la lista de nodos: al limpiar, el ref ya puede apuntar a otra
    // cosa y quedarian estilos escritos sobre elementos que ya no son estos.
    const nodos = cajas.current;

    let cuadro = 0;
    let activo = -1;

    const pintar = () => {
      cuadro = 0;

      const centro = window.innerHeight / 2;
      let cercano = -1;
      let minima = Infinity;

      nodos.forEach((nodo, i) => {
        if (!nodo) return;
        const r = nodo.getBoundingClientRect();
        const distancia = Math.abs(r.top + r.height / 2 - centro);
        if (distancia < minima) {
          minima = distancia;
          cercano = i;
        }
      });

      // Solo se toca el DOM cuando efectivamente cambia cual esta al frente.
      if (cercano === activo) return;
      activo = cercano;

      nodos.forEach((nodo, i) => {
        if (nodo) nodo.style.opacity = i === cercano ? "1" : ATENUADO;
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
      for (const nodo of nodos) if (nodo) nodo.style.opacity = "";
    };
  }, []);

  return (
    <>
      {steps.map((step, i) => (
        <Reveal key={step.verb} delay={i * 0.06}>
          <div
            ref={(nodo) => {
              cajas.current[i] = nodo;
            }}
            className="border-t border-line py-10 transition-opacity duration-500 ease-[var(--ease-out-expo)] first:border-t-0 first:pt-0 md:py-14"
          >
            <h3 className="display font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] text-paper sm:text-[9vw] lg:text-[min(5.6vw,89.6px)]">
              {step.verb}
            </h3>
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-paper-dim">
              {step.body}
            </p>
          </div>
        </Reveal>
      ))}
    </>
  );
}
