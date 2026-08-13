"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveSectionVideos, type SaveState } from "@/app/admin/actions";
import { Uploader } from "@/components/admin/uploader";
import { services } from "@/lib/site";

const initial: SaveState = { status: "idle" };

const field =
  "w-full border border-line bg-ink-800 px-4 py-2.5 text-sm text-paper placeholder:text-paper-dim focus:border-flame focus:outline-none";

/** Las secciones que llevan video de fondo, mas el hero. */
const CAMPOS = [
  {
    slug: "hero",
    name: "Portada",
    hint: "El video grande de arriba de todo. Si lo dejás vacío usa el último trabajo publicado.",
  },
  ...services
    .filter((s) => s.media === "video")
    .map((s) => ({ slug: s.slug, name: s.name, hint: s.summary })),
];

function Guardar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-full flame-bg px-7 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 disabled:opacity-70"
    >
      {pending ? "Guardando" : "Guardar videos"}
    </button>
  );
}

export function SectionsForm({
  actuales,
  archivos,
}: {
  actuales: Record<string, string>;
  archivos: Record<string, string>;
}) {
  const [state, formAction] = useActionState(saveSectionVideos, initial);
  const [mp4, setMp4] = useState<Record<string, string>>(archivos);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {CAMPOS.map((campo) => {
        const id = `seccion_${campo.slug}`;
        const actual = actuales[campo.slug];

        return (
          <div key={campo.slug} className="border-t border-line pt-6">
            <label htmlFor={id} className="text-base font-medium text-paper">
              {campo.name}
            </label>
            <p className="mb-3 mt-1 max-w-[64ch] text-xs leading-relaxed text-paper-faint">
              {campo.hint}
            </p>

            <input
              id={id}
              name={id}
              defaultValue={actual ? `https://youtu.be/${actual}` : ""}
              placeholder="https://youtu.be/XXXXXXXXXXX"
              className={field}
            />

            {actual && !mp4[campo.slug] && (
              <p className="mt-2 text-xs text-paper-faint">
                Ahora usa el video{" "}
                <a
                  href={`https://youtu.be/${actual}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-flame-warm transition-opacity hover:opacity-70"
                >
                  {actual}
                </a>
              </p>
            )}

            {/*
              El archivo propio va debajo del enlace de YouTube y no en su lugar
              porque conviven: si hay archivo manda el archivo, y si se borra
              vuelve a andar el de YouTube sin tener que volver a pegarlo.
            */}
            <div className="mt-4 border-l-2 border-line pl-4">
              <p className="text-sm font-medium text-paper">
                O un archivo propio{" "}
                <span className="font-normal text-paper-faint">— si cargás uno, gana sobre YouTube</span>
              </p>
              <p className="mb-2 mt-1 max-w-[64ch] text-xs leading-relaxed text-paper-faint">
                Un MP4 corto y mudo, de 10 a 15 segundos. Se ve sin ningún control
                encima y arranca más rápido, porque no pasa por el reproductor de
                YouTube. Conviene que pese menos de 5 MB.
              </p>

              <input
                name={`mp4_${campo.slug}`}
                value={mp4[campo.slug] ?? ""}
                onChange={(e) =>
                  setMp4((m) => ({ ...m, [campo.slug]: e.target.value }))
                }
                placeholder="Todavía sin archivo"
                className={field}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Uploader
                  carpeta="portadas"
                  etiqueta="Subir MP4"
                  acepta="video/mp4,video/webm"
                  onSubido={([url]) =>
                    setMp4((m) => ({ ...m, [campo.slug]: url }))
                  }
                />

                {mp4[campo.slug] && (
                  <button
                    type="button"
                    onClick={() => setMp4((m) => ({ ...m, [campo.slug]: "" }))}
                    className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-faint transition-colors hover:text-flame-warm"
                  >
                    Quitar
                  </button>
                )}
              </div>

              {mp4[campo.slug] && (
                <video
                  key={mp4[campo.slug]}
                  src={mp4[campo.slug]}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="mt-3 h-28 w-full bg-ink-800 object-cover"
                />
              )}
            </div>
          </div>
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
