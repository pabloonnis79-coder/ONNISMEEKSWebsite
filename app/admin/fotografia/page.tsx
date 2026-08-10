import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { GalleriesForm } from "./galleries-form";
import { getPhotoGalleries } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "Fotografía",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PhotographyAdminPage() {
  const actuales = await getPhotoGalleries();

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
        Fotografía
      </h1>
      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-paper-dim">
        Las galerías de la página de producción fotográfica, agrupadas por
        categoría. Cada categoría con título y sus fotos. Las que dejes sin
        título o sin fotos no se muestran.
      </p>

      <div className="mt-10">
        <GalleriesForm actuales={actuales} />
      </div>
    </div>
  );
}
