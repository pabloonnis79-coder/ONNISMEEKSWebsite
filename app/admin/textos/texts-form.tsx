"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveTextos, type SaveState } from "@/app/admin/actions";
import { GRUPOS } from "@/lib/textos";

const initial: SaveState = { status: "idle" };

const field =
  "w-full border border-line bg-ink-800 px-4 py-2.5 text-sm leading-relaxed text-paper placeholder:text-paper-dim focus:border-flame focus:outline-none";

function Guardar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-full flame-bg px-7 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 disabled:opacity-70"
    >
      {pending ? "Guardando" : "Guardar textos"}
    </button>
  );
}

export function TextsForm({ actuales }: { actuales: Record<string, string> }) {
  const [state, formAction] = useActionState(saveTextos, initial);
  const [valores, setValores] = useState(actuales);

  return (
    <form action={formAction} className="flex flex-col gap-14">
      {GRUPOS.map((grupo) => (
        <section key={grupo.titulo}>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
            {grupo.titulo}
          </h2>
          {grupo.descripcion && (
            <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-paper-faint">
              {grupo.descripcion}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-6">
            {grupo.campos.map((campo) => {
              const valor = valores[campo.id] ?? campo.valor;
              const cambiado = valor.trim() !== campo.valor.trim();

              return (
                <div key={campo.id} className="border-t border-line pt-5">
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
                    <label
                      htmlFor={campo.id}
                      className="text-sm font-medium text-paper"
                    >
                      {campo.etiqueta}
                    </label>

                    {/*
                      Volver al original solo aparece si hay algo que volver.
                      Un boton que no hace nada es peor que no tenerlo.
                    */}
                    {cambiado && (
                      <button
                        type="button"
                        onClick={() =>
                          setValores((v) => ({ ...v, [campo.id]: campo.valor }))
                        }
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-faint transition-colors hover:text-flame-warm"
                      >
                        Volver al original
                      </button>
                    )}
                  </div>

                  {campo.ayuda && (
                    <p className="mb-2 max-w-[64ch] text-xs leading-relaxed text-paper-faint">
                      {campo.ayuda}
                    </p>
                  )}

                  {campo.largo === "parrafo" ? (
                    <textarea
                      id={campo.id}
                      name={`texto_${campo.id}`}
                      value={valor}
                      onChange={(e) =>
                        setValores((v) => ({ ...v, [campo.id]: e.target.value }))
                      }
                      rows={3}
                      className={`${field} resize-y`}
                    />
                  ) : (
                    <input
                      id={campo.id}
                      name={`texto_${campo.id}`}
                      value={valor}
                      onChange={(e) =>
                        setValores((v) => ({ ...v, [campo.id]: e.target.value }))
                      }
                      className={field}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/*
        La barra queda pegada abajo: la lista es larga y no se puede pedir que
        alguien vuelva al final de la pagina cada vez que corrige una palabra.
      */}
      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-4 border-t border-line bg-ink/95 px-5 py-5 backdrop-blur md:-mx-10 md:px-10">
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
