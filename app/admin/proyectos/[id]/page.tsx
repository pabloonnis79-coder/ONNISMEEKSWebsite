import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { EditForm } from "./edit-form";

export const metadata: Metadata = {
  title: "Editar proyecto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-paper-dim transition-colors hover:text-paper"
        >
          <ArrowLeftIcon size={15} weight="bold" />
          Volver al panel
        </Link>

        <Link
          href={`/proyectos/${data.slug}`}
          target="_blank"
          className="text-sm text-flame-warm transition-opacity hover:opacity-70"
        >
          Ver la ficha pública
        </Link>
      </div>

      <h1 className="mt-8 font-display text-3xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
        {data.project_name || data.title}
      </h1>
      <p className="mt-2 font-mono text-xs text-paper-faint">
        {data.source === "youtube"
          ? `Sincronizado desde YouTube, id ${data.youtube_id}`
          : "Proyecto cargado a mano"}
      </p>

      <div className="mt-10">
        <EditForm project={data} />
      </div>
    </div>
  );
}
