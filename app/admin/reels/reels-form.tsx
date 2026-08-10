"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveReels, type SaveState } from "@/app/admin/actions";
import type { Reel } from "@/lib/db/settings";
import { extraerYoutubeId, youtubeThumb } from "@/lib/utils";

const initial: SaveState = { status: "idle" };

/** Tiene que coincidir con MAX_REELS de lib/db/settings. */
const MAX = 8;

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
      {pending ? "Publicando" : "Publicar reels"}
    </button>
  );
}

export function ReelsForm({ actuales }: { actuales: Reel[] }) {
  const [state, formAction] = useActionState(saveReels, initial);
  const [urls, setUrls] = useState<string[]>(() =>
    Array.from({ length: MAX }, (_, i) =>
      actuales[i] ? `https://youtu.be/${actuales[i].youtubeId}` : "",
    ),
  );

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {Array.from({ length: MAX }, (_, i) => {
        const actual = actuales[i];
        // Vista previa en vivo: si el enlace es valido, se ve la miniatura.
        const id = extraerYoutubeId(urls[i]);

        return (
          <fieldset key={i} className="border-t border-line pt-6">
            <legend className="sr-only">Reel {i + 1}</legend>

            <div className="flex gap-5">
              {/* Miniatura en 9:16, igual que se va a ver en el sitio. */}
              <div className="relative aspect-[9/16] w-20 shrink-0 overflow-hidden bg-ink-800">
                {id ? (
                  <Image
                    src={youtubeThumb(id)}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] uppercase tracking-wider text-paper-faint">
                    {i + 1}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <label
                  htmlFor={`reel_url_${i}`}
                  className="mb-2 block text-sm font-medium text-paper"
                >
                  Reel {i + 1}
                </label>
                <input
                  id={`reel_url_${i}`}
                  name={`reel_url_${i}`}
                  value={urls[i]}
                  onChange={(e) =>
                    setUrls((u) => u.map((v, j) => (j === i ? e.target.value : v)))
                  }
                  placeholder="https://youtube.com/shorts/..."
                  className={field}
                />

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    name={`reel_titulo_${i}`}
                    defaultValue={actual?.titulo ?? ""}
                    placeholder="Título, opcional"
                    className={field}
                  />
                  <input
                    name={`reel_cliente_${i}`}
                    defaultValue={actual?.cliente ?? ""}
                    placeholder="Cliente, opcional"
                    className={field}
                  />
                </div>

                {urls[i] && !id && (
                  <p className="mt-2 text-xs text-flame-warm">
                    No reconozco el enlace. Pegá la dirección completa del Short.
                  </p>
                )}
              </div>
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
