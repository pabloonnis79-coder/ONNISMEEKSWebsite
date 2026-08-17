import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { TextsForm } from "./texts-form";
import { getTextos } from "@/lib/db/textos";

export const metadata: Metadata = {
  title: "Textos del sitio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TextosPage() {
  const actuales = await getTextos();

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
        Textos del sitio
      </h1>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-dim">
        Los títulos y textos de la portada. Se cambian acá y se ven en el sitio
        apenas guardás.
      </p>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-faint">
        Cada campo arranca con el texto original. Si lo cambiás, aparece un
        botón para volver atrás. Si lo dejás vacío también vuelve al original:
        el sitio nunca queda con un espacio en blanco.
      </p>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-faint">
        Cada sección tiene su propio botón de guardar, y cualquiera de ellos
        guarda toda la página. Así podés corregir cosas en dos lugares distintos
        y no perder ninguna.
      </p>

      <div className="mt-12">
        <TextsForm actuales={actuales} />
      </div>
    </div>
  );
}
