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

/** Tiene que coincidir con ESCALAS_MARCAS de lib/db/settings. */
const ESCALAS = [0.25, 0.5, 1, 1.25, 1.5, 2];

/** Altura del logo al tamaño normal, igual que en el carrusel del sitio. */
const ALTO_BASE = 40;

export function BrandsForm({
  actuales,
  escalaActual,
}: {
  actuales: Marca[];
  escalaActual: number;
}) {
  const [state, formAction] = useActionState(saveBrandLogos, initial);
  const [logos, setLogos] = useState<string[]>(() =>
    Array.from({ length: MAX }, (_, i) => actuales[i]?.logo ?? ""),
  );
  const [escala, setEscala] = useState(escalaActual);

  const cargados = logos.filter(Boolean);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <fieldset className="border border-line p-5">
        <legend className="px-2 font-mono text-[11px] uppercase tracking-[0.18em] text-flame">
          Tamaño de los logos
        </legend>

        <p className="mb-4 max-w-[62ch] text-sm leading-relaxed text-paper-dim">
          Se aplica a todos a la vez. La vista previa de abajo muestra el tamaño
          real que van a tener en la portada.
        </p>

        <input type="hidden" name="escala" value={escala} />

        <div className="flex flex-wrap gap-2">
          {ESCALAS.map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => setEscala(valor)}
              aria-pressed={escala === valor}
              className={`inline-flex h-9 items-center rounded-full border px-5 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                escala === valor
                  ? "border-flame bg-flame text-ink"
                  : "border-line text-paper hover:border-flame-warm hover:text-flame-warm"
              }`}
            >
              ×{valor}
            </button>
          ))}
        </div>

        {cargados.length > 0 && (
          <div className="mt-6 overflow-x-auto border border-line bg-ink-800 p-5">
            <div className="flex w-max items-center gap-10">
              {cargados.map((logo, i) => (
                <Image
                  key={`${logo}-${i}`}
                  src={logo}
                  alt=""
                  width={400}
                  height={160}
                  style={{ height: Math.round(ALTO_BASE * escala) }}
                  className="w-auto object-contain opacity-70 grayscale"
                />
              ))}
            </div>
          </div>
        )}
      </fieldset>

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
