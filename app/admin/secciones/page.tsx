import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { SectionsForm } from "./sections-form";
import { getSectionVideos } from "@/lib/db/settings";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Videos de las secciones",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SectionVideosPage() {
  const actuales = await getSectionVideos();
  const conFotos = services.filter((s) => s.media === "fotos");

  return (
    <div className="mx-auto max-w-[900px] px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-paper-dim transition-colors hover:text-paper"
      >
        <ArrowLeftIcon size={15} weight="bold" />
        Volver al panel
      </Link>

      <h1 className="mt-8 font-display text-3xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
        Videos de las secciones
      </h1>
      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-paper-dim">
        Pegá el enlace de YouTube que querés como fondo de cada sección de la
        portada. Podés pegar la URL completa, la corta de youtu.be o el id
        pelado. Si dejás un campo vacío, esa sección usa un trabajo publicado.
      </p>

      {conFotos.length > 0 && (
        <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-paper-faint">
          {conFotos.map((s) => s.name).join(" y ")} no lleva video: se muestra
          como grilla de imágenes, igual que en las productoras que usan
          fotografía fija para esa sección.
        </p>
      )}

      <div className="mt-10">
        <SectionsForm actuales={actuales} />
      </div>
    </div>
  );
}
