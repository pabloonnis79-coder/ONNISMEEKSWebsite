"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import type { Facets } from "@/lib/db/projects";
import { cn } from "@/lib/utils";

type Group = { key: string; label: string; options: Array<{ value: string; label: string }> };

export function ProjectFilters({ facets, total }: { facets: Facets; total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");

  // La barra escribe en la URL, así el resultado se puede compartir y el
  // servidor sigue siendo el que filtra.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (query) next.set("q", query);
      else next.delete("q");
      if (next.toString() === params.toString()) return;
      startTransition(() => router.replace(`/proyectos?${next.toString()}`, { scroll: false }));
    }, 320);
    return () => clearTimeout(timer);
  }, [query, params, router]);

  function toggle(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === value) next.delete(key);
    else next.set(key, value);
    startTransition(() => router.replace(`/proyectos?${next.toString()}`, { scroll: false }));
  }

  function clearAll() {
    setQuery("");
    startTransition(() => router.replace("/proyectos", { scroll: false }));
  }

  const groups: Group[] = [
    {
      key: "cliente",
      label: "Cliente",
      options: facets.clients.map((c) => ({ value: c.slug, label: c.name })),
    },
    {
      key: "anio",
      label: "Año",
      options: facets.years.map((y) => ({ value: String(y), label: String(y) })),
    },
    {
      key: "categoria",
      label: "Categoría",
      options: facets.categories.map((c) => ({ value: c, label: c })),
    },
    {
      key: "servicio",
      label: "Servicio",
      options: facets.services.map((s) => ({ value: s, label: s })),
    },
  ].filter((g) => g.options.length > 1);

  const activeCount = ["cliente", "anio", "categoria", "servicio"].filter((k) =>
    params.get(k),
  ).length;

  return (
    <div className="border-y border-line py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <label htmlFor="buscador" className="sr-only">
            Buscar proyectos por cliente, año, categoría o servicio
          </label>
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              size={18}
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-paper-dim"
              aria-hidden="true"
            />
            <input
              id="buscador"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por cliente, año, categoría o servicio"
              className="w-full border-0 border-b border-transparent bg-transparent py-2 pl-8 text-lg text-paper placeholder:text-paper-dim focus:border-flame focus:outline-none focus:ring-0 md:text-2xl"
            />
          </div>

          {(activeCount > 0 || query) && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
            >
              <XIcon size={12} weight="bold" />
              Limpiar
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-wrap items-center gap-2">
              <span className="mr-1 w-20 shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                {group.label}
              </span>
              {group.options.map((option) => {
                const active = params.get(group.key) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(group.key, option.value)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200",
                      active
                        ? "border-flame bg-flame text-ink"
                        : "border-line text-paper-dim hover:border-paper-faint hover:text-paper",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <p
          aria-live="polite"
          className={cn(
            "font-mono text-xs text-paper-faint transition-opacity",
            pending && "opacity-40",
          )}
        >
          {total} {total === 1 ? "proyecto" : "proyectos"}
        </p>
      </div>
    </div>
  );
}
