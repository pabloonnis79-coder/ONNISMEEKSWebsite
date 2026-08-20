"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveSecciones, type SaveState } from "@/app/admin/actions";

const initial: SaveState = { status: "idle" };

export type Seccion = {
  href: string;
  label: string;
  /** Cuantas cosas tiene cargadas hoy. */
  cuantas: number;
  /** Que es lo que cuenta: "premios", "notas". */
  unidad: string;
};

/**
 * Encender y apagar secciones del sitio.
 *
 * Se muestra cuanto tiene cargado cada una, porque es el dato que decide: nadie
 * puede saber de memoria si Premios tiene tres o cero. Con el numero al lado,
 * apagar una seccion vacia deja de ser una apuesta.
 */
export function SectionsForm({
  secciones,
  ocultas,
}: {
  secciones: Seccion[];
  ocultas: string[];
}) {
  const [state, formAction] = useActionState(saveSecciones, initial);
  const [apagadas, setApagadas] = useState<string[]>(ocultas);

  const alternar = (href: string) =>
    setApagadas((v) => (v.includes(href) ? v.filter((h) => h !== href) : [...v, href]));

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <ul className="flex flex-col border-t border-line">
        {secciones.map((s) => {
          const encendida = !apagadas.includes(s.href);

          return (
            <li key={s.href} className="border-b border-line">
              <label className="flex cursor-pointer items-start gap-4 py-5">
                <input
                  type="checkbox"
                  name="visible"
                  value={s.href}
                  checked={encendida}
                  onChange={() => alternar(s.href)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--flame)]"
                />

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span className="font-display text-lg font-extrabold uppercase leading-none tracking-[-0.03em] text-paper">
                      {s.label}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper-faint">
                      {s.cuantas === 0 ? `Sin ${s.unidad}` : `${s.cuantas} ${s.unidad}`}
                    </span>
                  </span>

                  <span className="mt-2 block font-mono text-[12px] text-paper-dim">
                    onnismeeks.com{s.href}
                  </span>

                  {!encendida && (
                    <span className="mt-2 block max-w-[62ch] text-xs leading-relaxed text-flame-warm">
                      Apagada: sale del menú y del pie, deja de figurar en el mapa
                      del sitio, y su dirección muestra «esta página no existe».
                    </span>
                  )}

                  {encendida && s.cuantas === 0 && (
                    <span className="mt-2 block max-w-[62ch] text-xs leading-relaxed text-paper-faint">
                      Está publicada y vacía. Es la que conviene apagar hasta que
                      tenga contenido.
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-4">
        <Guardar />
        {state.message && (
          <p
            role="status"
            className={`text-sm ${state.status === "error" ? "text-flame-warm" : "text-paper-dim"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Guardar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-full flame-bg px-7 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 disabled:opacity-70"
    >
      {pending ? "Guardando" : "Guardar"}
    </button>
  );
}
