"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { extraerYoutubeId, formatDuration, youtubeThumb } from "@/lib/utils";

export type VideoDelCanal = {
  id: string;
  titulo: string;
  duracion: number | null;
  fecha: string;
};

/**
 * Elegir el video del proyecto: de la lista del canal o pegando el enlace.
 *
 * Se muestra la miniatura del elegido antes de guardar. Sin eso, cargar un
 * proyecto a mano es escribir un id de once caracteres y confiar: el error
 * recien aparece en la ficha publica, cuando ya se publico.
 */
export function VideoPicker({
  inicial,
  videos,
}: {
  inicial: string;
  /** Los ultimos videos del canal. Vacio si no hay clave de YouTube. */
  videos: VideoDelCanal[];
}) {
  const [valor, setValor] = useState(inicial ? `https://youtu.be/${inicial}` : "");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);

  const id = extraerYoutubeId(valor);
  const elegido = videos.find((v) => v.id === id);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) => v.titulo.toLowerCase().includes(q));
  }, [videos, busqueda]);

  return (
    <div>
      {/* Lo que se guarda es el id, no el enlace: el enlace es solo la forma
          comoda de pegarlo. */}
      <input type="hidden" name="youtube_id" value={id ?? ""} />

      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="https://youtu.be/XXXXXXXXXXX"
        className="w-full border border-line bg-ink-800 px-4 py-2.5 text-sm text-paper placeholder:text-paper-dim focus:border-flame focus:outline-none"
      />

      {valor && !id && (
        <p className="mt-2 text-xs text-flame-warm">
          No reconozco el enlace. Pegá la dirección completa del video.
        </p>
      )}

      {id && (
        <div className="mt-4 flex gap-4 border border-line p-3">
          <div className="relative aspect-video w-40 shrink-0 overflow-hidden bg-ink-800">
            <Image
              src={youtubeThumb(id)}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-paper">
              {elegido?.titulo ?? "Video elegido"}
            </p>
            <p className="mt-1 font-mono text-xs text-paper-faint">
              {id}
              {elegido?.duracion ? ` · ${formatDuration(elegido.duracion)}` : ""}
            </p>
            <a
              href={`https://youtu.be/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-flame-warm transition-opacity hover:opacity-70"
            >
              Verlo en YouTube
            </a>
          </div>

          <button
            type="button"
            onClick={() => setValor("")}
            className="self-start text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-faint transition-colors hover:text-flame-warm"
          >
            Quitar
          </button>
        </div>
      )}

      {videos.length > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="inline-flex h-9 items-center rounded-full border border-line px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            {abierto ? "Cerrar la lista" : `Elegir del canal (${videos.length})`}
          </button>

          {abierto && (
            <div className="mt-4 border border-line">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                <MagnifyingGlassIcon size={14} className="shrink-0 text-paper-faint" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por título"
                  className="w-full bg-transparent text-sm text-paper placeholder:text-paper-dim focus:outline-none"
                />
              </div>

              {/* Alto acotado: el canal puede tener cientos y la lista no puede
                  empujar el resto del formulario fuera de la pantalla. */}
              <ul className="max-h-[420px] overflow-y-auto">
                {filtrados.length === 0 ? (
                  <li className="px-4 py-6 text-sm text-paper-faint">
                    Ningún video con ese título.
                  </li>
                ) : (
                  filtrados.map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setValor(`https://youtu.be/${v.id}`);
                          setAbierto(false);
                        }}
                        className={`flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left transition-colors hover:bg-ink-800 ${
                          v.id === id ? "bg-ink-800" : ""
                        }`}
                      >
                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden bg-ink-800">
                          <Image
                            src={youtubeThumb(v.id, "hq")}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-paper">{v.titulo}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-paper-faint">
                            {new Date(v.fecha).toLocaleDateString("es-AR")}
                            {v.duracion ? ` · ${formatDuration(v.duracion)}` : ""}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-paper-faint">
          No pude traer la lista del canal. Podés pegar el enlace igual.
        </p>
      )}
    </div>
  );
}
