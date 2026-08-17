import "server-only";
import { cache } from "react";

import { getTextos } from "@/lib/db/textos";
import { services, type Service } from "@/lib/site";

/**
 * Los servicios con los nombres y textos que el estudio haya escrito en el
 * panel.
 *
 * Devuelve la misma forma que la lista del codigo, asi las paginas no tienen
 * que saber de donde salio cada texto. Lo que nunca cambia es el slug ni el
 * tipo de medio: uno es la direccion de la pagina y el otro decide si la
 * seccion lleva video o grilla de fotos, y ninguna de las dos cosas es una
 * decision de redaccion.
 */
export const getServicios = cache(async (): Promise<Service[]> => {
  const t = await getTextos();

  return services.map((s) => ({
    ...s,
    name: t[`servicio.${s.slug}.nombre`] || s.name,
    summary: t[`servicio.${s.slug}.resumen`] || s.summary,
    includes: partirLineas(t[`servicio.${s.slug}.incluye`]) ?? s.includes,
  }));
});

/** Una lista escrita en el panel, un item por linea. */
function partirLineas(texto: string | undefined): string[] | null {
  if (!texto) return null;

  const items = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return items.length > 0 ? items : null;
}
