"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { saveAuthorities, type SaveState } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/browser";
import type { Autoridad } from "@/lib/db/settings";
import { slugify } from "@/lib/utils";

const initial: SaveState = { status: "idle" };

const field =
  "w-full border border-line bg-ink-800 px-4 py-2.5 text-sm text-paper placeholder:text-paper-dim focus:border-flame focus:outline-none";

const VACIA: Autoridad = { foto: "", nombre: "", apellido: "", cargo: "", email: "" };

function Guardar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-full flame-bg px-7 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 disabled:opacity-70"
    >
      {pending ? "Guardando" : "Guardar autoridades"}
    </button>
  );
}

/** Sube una foto al bucket y devuelve su dirección pública. */
function SubirFoto({
  indice,
  onSubida,
}: {
  indice: number;
  onSubida: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<string | null>(null);

  async function subir(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setEstado("Subiendo");
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `autoridades/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;

    const { error } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });

    if (error) {
      setEstado(`No se pudo subir: ${error.message}`);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onSubida(data.publicUrl);
    setEstado(null);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <input
        ref={input}
        id={`archivo_${indice}`}
        type="file"
        accept="image/*"
        onChange={(e) => void subir(e.target.files)}
        className="sr-only"
      />
      <label
        htmlFor={`archivo_${indice}`}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
      >
        <UploadSimpleIcon size={13} weight="bold" />
        Subir foto
      </label>
      {estado && <span className="text-xs text-paper-faint">{estado}</span>}
    </div>
  );
}

export function AuthoritiesForm({ actuales }: { actuales: Autoridad[] }) {
  const [state, formAction] = useActionState(saveAuthorities, initial);
  const [fotos, setFotos] = useState<string[]>(() =>
    [0, 1, 2].map((i) => actuales[i]?.foto ?? ""),
  );

  return (
    <form action={formAction} className="flex flex-col gap-10">
      {[0, 1, 2].map((i) => {
        const actual = actuales[i] ?? VACIA;

        return (
          <fieldset key={i} className="border-t border-line pt-6">
            <legend className="sr-only">Autoridad {i + 1}</legend>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-flame">
              Círculo {i + 1}
            </p>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label
                  htmlFor={`nombre_${i}`}
                  className="mb-2 block text-sm font-medium text-paper"
                >
                  Nombre
                </label>
                <input
                  id={`nombre_${i}`}
                  name={`nombre_${i}`}
                  defaultValue={actual.nombre}
                  className={field}
                />
              </div>

              <div>
                <label
                  htmlFor={`apellido_${i}`}
                  className="mb-2 block text-sm font-medium text-paper"
                >
                  Apellido
                </label>
                <input
                  id={`apellido_${i}`}
                  name={`apellido_${i}`}
                  defaultValue={actual.apellido}
                  className={field}
                />
              </div>

              <div>
                <label
                  htmlFor={`cargo_${i}`}
                  className="mb-2 block text-sm font-medium text-paper"
                >
                  Cargo
                </label>
                <input
                  id={`cargo_${i}`}
                  name={`cargo_${i}`}
                  defaultValue={actual.cargo}
                  placeholder="Dirección general"
                  className={field}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor={`email_${i}`}
                  className="mb-2 block text-sm font-medium text-paper"
                >
                  Correo{" "}
                  <span className="font-normal text-paper-faint">
                    — solo para armar la firma, no se publica en el sitio
                  </span>
                </label>
                <input
                  id={`email_${i}`}
                  name={`email_${i}`}
                  type="email"
                  defaultValue={actual.email}
                  placeholder="nombre@onnismeeks.com"
                  className={field}
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor={`foto_${i}`}
                className="mb-2 block text-sm font-medium text-paper"
              >
                Foto
              </label>
              <input
                id={`foto_${i}`}
                name={`foto_${i}`}
                value={fotos[i]}
                onChange={(e) =>
                  setFotos((f) => f.map((v, j) => (j === i ? e.target.value : v)))
                }
                placeholder="https://..."
                className={field}
              />
              <p className="mt-1.5 text-xs text-paper-faint">
                Se recorta en círculo, así que conviene una foto cuadrada con la
                cara centrada. Si la dejás vacía se muestran las iniciales.
              </p>

              <SubirFoto
                indice={i}
                onSubida={(url) =>
                  setFotos((f) => f.map((v, j) => (j === i ? url : v)))
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
