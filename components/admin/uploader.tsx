"use client";

import { useId, useRef, useState } from "react";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/browser";
import { slugify } from "@/lib/utils";

/**
 * Sube archivos al bucket del proyecto y devuelve sus direcciones publicas.
 *
 * Existe para no depender de Google Drive: un archivo subido acá siempre se
 * ve, mientras que un enlace de Drive deja de funcionar si alguien cambia los
 * permisos de la carpeta.
 */
export function Uploader({
  carpeta,
  multiple = false,
  etiqueta = "Subir archivo",
  onSubido,
}: {
  carpeta: string;
  multiple?: boolean;
  etiqueta?: string;
  onSubido: (urls: string[]) => void;
}) {
  const inputId = `subir-${useId().replace(/[:]/g, "")}`;
  const input = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<string | null>(null);

  async function subir(files: FileList | null) {
    if (!files || files.length === 0) return;

    setEstado(`Subiendo ${files.length}`);
    const supabase = createClient();
    const urls: string[] = [];
    const fallos: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "archivo";
      const path = `${carpeta}/${Date.now()}-${base}.${ext}`;

      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });

      if (error) {
        fallos.push(file.name);
        continue;
      }

      urls.push(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
    }

    if (urls.length > 0) onSubido(urls);
    setEstado(fallos.length > 0 ? `No se pudieron subir: ${fallos.join(", ")}` : null);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <input
        ref={input}
        id={inputId}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => void subir(e.target.files)}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
      >
        <UploadSimpleIcon size={13} weight="bold" />
        {etiqueta}
      </label>
      {estado && <span className="text-xs text-paper-faint">{estado}</span>}
    </div>
  );
}
