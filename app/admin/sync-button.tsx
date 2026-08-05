"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

export function SyncButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [detail, setDetail] = useState<string | null>(null);

  async function run() {
    setState("running");
    setDetail(null);

    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setState("error");
        setDetail(data.error ?? (data.errors ?? []).join(" | ") ?? "Error desconocido");
        return;
      }

      setState("done");
      setDetail(`${data.created} nuevos, ${data.updated} actualizados, ${data.skipped} sin cambios`);
      router.refresh();
    } catch (error) {
      setState("error");
      setDetail(error instanceof Error ? error.message : "Error de red");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={state === "running"}
        className="inline-flex h-10 items-center gap-2 rounded-full flame-bg px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 disabled:opacity-70"
      >
        <ArrowsClockwiseIcon
          size={14}
          weight="bold"
          className={state === "running" ? "animate-spin" : ""}
        />
        {state === "running" ? "Sincronizando" : "Sincronizar YouTube"}
      </button>

      {detail && (
        <p
          role="status"
          className={`max-w-[42ch] text-xs ${state === "error" ? "text-flame-warm" : "text-paper-faint"}`}
        >
          {detail}
        </p>
      )}
    </div>
  );
}
