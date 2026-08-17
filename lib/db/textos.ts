import "server-only";
import { cache } from "react";

import { leerAjuste } from "@/lib/db/settings";
import { TEXTOS_POR_DEFECTO } from "@/lib/textos";

/** Clave donde viven los textos que el estudio reescribio. */
export const CLAVE_TEXTOS = "textos";

/**
 * Los textos del sitio, con lo editado desde el panel encima de lo original.
 *
 * Va envuelto en cache de React: cualquier componente del arbol puede pedirlo
 * sin recibirlo por props, y la consulta a la base se hace una sola vez por
 * pedido por mas veces que se llame.
 *
 * Se guarda solo lo modificado, no una copia entera. Asi una correccion hecha
 * en el codigo llega a los textos que nadie toco, en vez de quedar tapada por
 * una copia vieja.
 */
export const getTextos = cache(async (): Promise<Record<string, string>> => {
  const guardado = await leerAjuste(CLAVE_TEXTOS);

  if (!guardado || typeof guardado !== "object") return TEXTOS_POR_DEFECTO;

  const editados = Object.fromEntries(
    Object.entries(guardado as Record<string, unknown>)
      .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
      .map(([k, v]) => [k, (v as string).trim()]),
  );

  return { ...TEXTOS_POR_DEFECTO, ...editados };
});
