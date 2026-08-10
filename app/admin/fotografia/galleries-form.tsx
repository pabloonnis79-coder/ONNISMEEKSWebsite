"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { savePhotoGalleries, type SaveState } from "@/app/admin/actions";
import { Uploader } from "@/components/admin/uploader";
import type { GaleriaFoto } from "@/lib/db/settings";

const initial: SaveState = { status: "idle" };
const MAX = 4;

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
      {pending ? "Guardando" : "Guardar galerías"}
    </button>
  );
}

export function GalleriesForm({ actuales }: { actuales: GaleriaFoto[] }) {
  const [state, formAction] = useActionState(savePhotoGalleries, initial);
  const [fotos, setFotos] = useState<string[]>(() =>
    Array.from({ length: MAX }, (_, i) => (actuales[i]?.fotos ?? []).join("\n")),
  );

  return (
    <form action={formAction} className="flex flex-col gap-10">
      {Array.from({ length: MAX }, (_, i) => {
        const actual = actuales[i];
        const cuenta = fotos[i].split("\n").filter((l) => l.trim()).length;

        return (
          <fieldset key={i} className="border-t border-line pt-6">
            <legend className="sr-only">Categoría {i + 1}</legend>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-flame">
                Categoría {i + 1}
              </p>
              <p className="font-mono text-[11px] text-paper-faint">
                {cuenta} {cuenta === 1 ? "foto" : "fotos"}
              </p>
            </div>

            <label
              htmlFor={`titulo_${i}`}
              className="mb-2 block text-sm font-medium text-paper"
            >
              Título
            </label>
            <input
              id={`titulo_${i}`}
              name={`titulo_${i}`}
              defaultValue={actual?.titulo ?? ""}
              placeholder="Producto, Gastronomía, Moda..."
              className={field}
            />

            <label
              htmlFor={`fotos_${i}`}
              className="mb-2 mt-5 block text-sm font-medium text-paper"
            >
              Fotos
            </label>
            <textarea
              id={`fotos_${i}`}
              name={`fotos_${i}`}
              rows={6}
              value={fotos[i]}
              onChange={(e) =>
                setFotos((f) => f.map((v, j) => (j === i ? e.target.value : v)))
              }
              placeholder={"https://...\nhttps://drive.google.com/file/d/..."}
              className={field}
            />
            <p className="mt-1.5 text-xs leading-relaxed text-paper-faint">
              Una dirección por línea. Acepta enlaces de Google Drive: se
              convierten solos, pero el archivo tiene que estar compartido como
              <span className="text-paper"> cualquiera con el enlace</span>. Si
              lo subís acá abajo no dependés de eso.
            </p>

            <Uploader
              carpeta={`fotografia/categoria-${i + 1}`}
              multiple
              etiqueta="Subir fotos"
              onSubido={(urls) =>
                setFotos((f) =>
                  f.map((v, j) => (j === i ? [v, ...urls].filter(Boolean).join("\n") : v)),
                )
              }
            />
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
