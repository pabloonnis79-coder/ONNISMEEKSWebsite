"use client";

import { useRef, useState } from "react";

/**
 * Bloque de texto con boton para copiarlo. Si el navegador no deja escribir en
 * el portapapeles, deja el texto seleccionado para que alcance con Ctrl+C.
 */
export function BloqueCopiable({
  titulo,
  texto,
  nota,
}: {
  titulo: string;
  texto: string;
  nota?: string;
}) {
  const cuerpo = useRef<HTMLPreElement>(null);
  const [estado, setEstado] = useState<"idle" | "copiado" | "seleccionado">("idle");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      const nodo = cuerpo.current;
      if (!nodo) return;

      const rango = document.createRange();
      rango.selectNodeContents(nodo);
      const seleccion = window.getSelection();
      seleccion?.removeAllRanges();
      seleccion?.addRange(rango);
      setEstado("seleccionado");
    }

    setTimeout(() => setEstado("idle"), 4000);
  }

  return (
    <div className="border border-line">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-flame">
          {titulo}
        </p>

        <button
          type="button"
          onClick={copiar}
          className="inline-flex h-9 items-center rounded-full border border-line px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
        >
          {estado === "copiado"
            ? "Copiado"
            : estado === "seleccionado"
              ? "Ahora Ctrl+C"
              : "Copiar"}
        </button>
      </div>

      <pre
        ref={cuerpo}
        className="overflow-x-auto bg-ink-800 px-5 py-4 font-mono text-[12px] leading-relaxed text-paper-dim"
      >
        {texto}
      </pre>

      {nota && (
        <p className="border-t border-line px-5 py-3 text-xs text-paper-faint">{nota}</p>
      )}
    </div>
  );
}
