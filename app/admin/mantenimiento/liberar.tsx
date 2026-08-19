"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { liberarEspacio } from "@/app/admin/actions";
import { formatoTamano } from "@/lib/utils";
import type { ArchivoSuelto } from "@/lib/db/mantenimiento";

/**
 * Borrar los archivos que no se publican en ningun lado.
 *
 * Se ven antes de borrarse. Una lista de nombres como
 * "1786369211386-captura.png" no le dice nada a nadie; la miniatura si, y es la
 * unica forma de que alguien reconozca lo que esta por perder.
 *
 * Vienen todos tildados, que es lo que se quiere casi siempre, pero se pueden
 * destildar uno por uno.
 */
export function Liberar({ archivos }: { archivos: ArchivoSuelto[] }) {
  const [elegidos, setElegidos] = useState<string[]>(archivos.map((a) => a.ruta));

  const alternar = (ruta: string) =>
    setElegidos((v) => (v.includes(ruta) ? v.filter((r) => r !== ruta) : [...v, ruta]));

  const bytes = archivos
    .filter((a) => elegidos.includes(a.ruta))
    .reduce((n, a) => n + a.bytes, 0);

  return (
    <form
      action={liberarEspacio}
      onSubmit={(e) => {
        // Es definitivo y no hay papelera: preguntar una vez es lo minimo.
        const ok = window.confirm(
          `Se van a borrar ${elegidos.length} ${elegidos.length === 1 ? "archivo" : "archivos"} para siempre. No se pueden recuperar.\n\n¿Seguimos?`,
        );
        if (!ok) e.preventDefault();
      }}
      className="mt-5"
    >
      <ul className="flex flex-col border-t border-line">
        {archivos.map((a) => {
          const elegido = elegidos.includes(a.ruta);

          return (
            <li key={a.ruta} className="flex items-center gap-4 border-b border-line pr-1">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 py-3">
                <input
                  type="checkbox"
                  name="ruta"
                  value={a.ruta}
                  checked={elegido}
                  onChange={() => alternar(a.ruta)}
                  className="h-4 w-4 shrink-0 accent-[var(--flame)]"
                />

                <Vista archivo={a} />

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[12px] text-paper-dim">
                    {a.ruta}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-paper-faint">
                    {formatoTamano(a.bytes)}
                    {a.fecha ? ` · ${new Date(a.fecha).toLocaleDateString("es-AR")}` : ""}
                  </span>
                </span>
              </label>

              {/*
                Fuera de la etiqueta: adentro, abrir el archivo tildaria la
                casilla de paso.
              */}
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-faint transition-colors hover:text-flame-warm"
              >
                Abrir
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Borrar cuantos={elegidos.length} bytes={bytes} />

        {elegidos.length < archivos.length && (
          <button
            type="button"
            onClick={() => setElegidos(archivos.map((a) => a.ruta))}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-faint transition-colors hover:text-flame-warm"
          >
            Tildar todos
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * La miniatura del archivo.
 *
 * Los videos van en una etiqueta de video y no de imagen: un MP4 dentro de un
 * img se ve como una imagen rota, que es la peor pista posible cuando lo que se
 * esta decidiendo es si algo se borra o no.
 */
function Vista({ archivo }: { archivo: ArchivoSuelto }) {
  const caja = "h-12 w-12 shrink-0 rounded-sm bg-ink-800 object-cover";

  if (/\.(mp4|webm|mov|m4v)$/i.test(archivo.nombre)) {
    return <video src={archivo.url} className={caja} preload="metadata" muted playsInline />;
  }

  /*
    Imagen suelta y no next/image: son archivos que estan por desaparecer, no
    vale la pena optimizarlos ni guardarlos en el cache de imagenes.
  */
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={archivo.url} alt="" className={caja} loading="lazy" />;
}

function Borrar({ cuantos, bytes }: { cuantos: number; bytes: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || cuantos === 0}
      className="inline-flex h-11 items-center rounded-full border border-line px-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm disabled:opacity-40 disabled:hover:border-line disabled:hover:text-paper"
    >
      {pending
        ? "Borrando"
        : cuantos === 0
          ? "No hay nada tildado"
          : `Borrar ${cuantos} y liberar ${formatoTamano(bytes)}`}
    </button>
  );
}
