import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { BrandsForm } from "./brands-form";
import { getBrandLogos } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "Marcas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BrandsAdminPage() {
  const actuales = await getBrandLogos();

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
        Marcas
      </h1>
      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-paper-dim">
        Los logos del carrusel de la portada. Se muestran en escala de grises y
        recuperan el color al pasar el cursor, para que no compitan con el
        trabajo. Conviene un PNG con fondo transparente y el logo en blanco.
      </p>
      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-paper-faint">
        Las filas que dejes sin nombre y sin logo se descartan. Si cargás nombre
        pero no logo, se muestra el nombre escrito.
      </p>

      <div className="mt-10">
        <BrandsForm actuales={actuales} />
      </div>
    </div>
  );
}
