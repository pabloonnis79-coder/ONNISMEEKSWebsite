"use client";

import { useRef, useState } from "react";

/**
 * Una firma lista para copiar.
 *
 * El boton copia HTML con formato, no texto pelado: al pegarlo en Zoho entra
 * ya armado, con los colores y los enlaces. Si el navegador no deja escribir
 * en el portapapeles, cae en seleccionar el bloque para que alcance con Ctrl+C.
 */
export function FirmaCard({
  titulo,
  html,
  nota,
}: {
  titulo: string;
  html: string;
  nota?: string;
}) {
  const vista = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<"idle" | "copiado" | "seleccionado">("idle");

  async function copiar() {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([html], { type: "text/plain" }),
        }),
      ]);
      setEstado("copiado");
    } catch {
      // Sin permiso de portapapeles: dejamos el bloque seleccionado.
      const nodo = vista.current;
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
    <div className="border border-line p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-faint">
          {titulo}
        </p>

        <button
          type="button"
          onClick={copiar}
          className="inline-flex h-9 items-center rounded-full border border-line px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
        >
          {estado === "copiado"
            ? "Copiada"
            : estado === "seleccionado"
              ? "Ahora Ctrl+C"
              : "Copiar firma"}
        </button>
      </div>

      {/* Fondo claro a propósito: así se ve como la va a ver quien la reciba. */}
      <div className="overflow-x-auto bg-white p-6">
        <div ref={vista} dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {nota && <p className="mt-3 text-xs text-paper-faint">{nota}</p>}
    </div>
  );
}
