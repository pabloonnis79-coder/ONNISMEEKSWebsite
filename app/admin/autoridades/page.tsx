import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { AuthoritiesForm } from "./authorities-form";
import { getAuthorities } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "Autoridades",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AuthoritiesPage() {
  const actuales = await getAuthorities();

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
        Autoridades
      </h1>
      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-paper-dim">
        Los tres círculos que aparecen en la portada, con foto, nombre, apellido
        y cargo. Si dejás los tres sin nombre, la sección no se muestra.
      </p>

      <div className="mt-10">
        <AuthoritiesForm actuales={actuales} />
      </div>
    </div>
  );
}
