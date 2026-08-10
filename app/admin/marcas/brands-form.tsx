"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveBrandLogos, type SaveState } from "@/app/admin/actions";
import { Uploader } from "@/components/admin/uploader";
import type { Marca } from "@/lib/db/settings";

const initial: SaveState = { status: "idle" };
const MAX = 12;

const field =
  "w-full border border-line bg-ink-800 px-4 py-2.5 text-sm text-paper placeholder:text-paper-dim focus:border-flame focus:outline-none";

function Guardar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-full flame-bg px-7 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 disabled:opacity-70"
    >
      {pending ? "Guardando" : "Guardar marcas"}
    </button>
  );
}

export function BrandsForm({ actuales }: { actuales: Marca[] }) {
  const [state, formAction] = useActionState(saveBrandLogos, initial);
  const [logos, setLogos] = useState<string[]>(() =>
    Array.from({ length: MAX }, (_, i) => actuales[i]?.logo ?? ""),
  );

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {Array.from({ length: MAX }, (_, i) => {
        const actual = actuales[i];

        return (
          <fieldset key={i} className="border-t border-line pt-6">
            <legend className="sr-only">Marca {i + 1}</legend>

            <div className="grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label
                  htmlFor={`marca_nombre_${i}`}
                  className="mb-2 block text-sm font-medium text-paper"
                >
                  Marca {i + 1}
                </label>
                <input
                  id={`marca_nombre_${i}`}
                  name={`marca_nombre_${i}`}
                  defaultValue={actual?.nombre ?? ""}
                  placeholder="Nombre de la marca"
                  className={field}
                />
              </div>

              <div>
                <label
                  htmlFor={`marca_sitio_${i}`}
                  className="mb-2 block text-sm font-medium text-paper"
                >
                  Sitio, opcional
                </label>
                <input
                  id={`marca_sitio_${i}`}
                  name={`marca_sitio_${i}`}
                  defaultValue={actual?.sitio ?? ""}
                  placeholder="https://..."
                  className={field}
                />
              </div>

              {/* Vista previa sobre el mismo fondo que va a tener en la portada. */}
              <div className="flex h-[46px] w-28 shrink-0 items-center justify-center border border-line bg-ink px-2">
                {logos[i] ? (
                  <Image
                    src={logos[i]}
                    alt=""
                    width={110}
                    height={40}
                    className="h-7 w-auto object-contain"
                  />
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-paper-faint">
                    sin logo
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`marca_logo_${i}`}
                className="mb-2 block text-sm font-medium text-paper"
              >
                Logo
              </label>
              <input
                id={`marca_logo_${i}`}
                name={`marca_logo_${i}`}
                value={logos[i]}
                onChange={(e) =>
                  setLogos((l) => l.map((v, j) => (j === i ? e.target.value : v)))
                }
                placeholder="https://... o enlace de Google Drive"
                className={field}
              />

              <Uploader
                carpeta="marcas"
                etiqueta="Subir logo"
                onSubido={(urls) =>
                  setLogos((l) => l.map((v, j) => (j === i ? urls[0] : v)))
                }
              />
            </div>
          </fieldset>
        );
      })}

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
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
