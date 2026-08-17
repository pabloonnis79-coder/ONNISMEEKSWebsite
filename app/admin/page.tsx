import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminRow } from "./admin-row";
import { SyncButton } from "./sync-button";
import { createManualProject, signOut } from "./actions";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: runs }, { data: messages }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, slug, title, project_name, client_name, year, featured, hidden, status, source, sort_order, youtube_id, cover_url",
      )
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false }),
    supabase
      .from("sync_runs")
      .select("id, started_at, finished_at, found, created, updated, status")
      .order("started_at", { ascending: false })
      .limit(1),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const list = (projects ?? []) as any[];
  const lastRun = (runs ?? [])[0] as any;

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
            Panel
          </h1>
          <p className="mt-2 text-sm text-paper-dim">
            {list.length} proyectos, {list.filter((p) => p.featured).length} destacados,{" "}
            {list.filter((p) => p.hidden).length} ocultos
            {messages ? `, ${messages.length} mensajes recientes` : ""}
          </p>
          {lastRun && (
            <p className="mt-1 font-mono text-xs text-paper-faint">
              Última sincronización: {new Date(lastRun.started_at).toLocaleString("es-AR")}
              {", "}
              {lastRun.created} nuevos, {lastRun.updated} actualizados, estado{" "}
              {lastRun.status}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SyncButton />

          <Link
            href="/admin/formato"
            className="inline-flex h-10 items-center rounded-full border border-flame-warm px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-flame-warm transition-colors hover:bg-flame-warm hover:text-ink"
          >
            Cómo cargar un proyecto
          </Link>

          <Link
            href="/admin/textos"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Textos
          </Link>

          <Link
            href="/admin/secciones"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Videos de secciones
          </Link>

          <Link
            href="/admin/autoridades"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Autoridades
          </Link>

          <Link
            href="/admin/fotografia"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Fotografía
          </Link>

          <Link
            href="/admin/marcas"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Marcas
          </Link>

          <Link
            href="/admin/reels"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Reels
          </Link>

          <Link
            href="/admin/firmas"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Firmas
          </Link>

          <Link
            href="/admin/mantenimiento"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Mantenimiento
          </Link>

          <Link
            href="/admin/mensajes"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
          >
            Mensajes
          </Link>

          <form action={createManualProject}>
            <input type="hidden" name="title" value="Proyecto nuevo" />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
            >
              Nuevo proyecto
            </button>
          </form>

          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper-dim transition-colors hover:text-paper"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      {list.length === 0 ? (
        <div className="mt-16 border border-line px-6 py-16 text-center">
          <p className="text-paper-dim">
            Todavía no hay proyectos. Ejecutá una sincronización o creá uno a mano.
          </p>
        </div>
      ) : (
        <ul className="mt-8">
          {list.map((project, i) => (
            <AdminRow
              key={project.id}
              project={project}
              first={i === 0}
              last={i === list.length - 1}
            />
          ))}
        </ul>
      )}

      <p className="mt-12 text-xs text-paper-faint">
        Los campos que edites a mano quedan bloqueados y la sincronización de
        YouTube deja de pisarlos.{" "}
        <Link href="/proyectos" className="text-flame-warm hover:opacity-70">
          Ver el sitio público
        </Link>
      </p>
    </div>
  );
}
