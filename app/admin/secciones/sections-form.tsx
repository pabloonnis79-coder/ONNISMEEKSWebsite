"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveSectionVideos, type SaveState } from "@/app/admin/actions";
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

export function SectionsForm({ actuales }: { actuales: Record<string, string> }) {
  const [state, formAction] = useActionState(saveSectionVideos, initial);

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

            {actual && (
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
