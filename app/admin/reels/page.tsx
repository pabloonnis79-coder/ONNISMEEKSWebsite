import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { ReelsForm } from "./reels-form";
import { getReels } from "@/lib/db/settings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reels",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReelsAdminPage() {
  const actuales = await getReels();

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
        Reels
      </h1>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-dim">
        Las piezas verticales de la portada, en 9:16, como se ven en Instagram.
        Se reproducen solas y sin sonido cuando entran en pantalla.
      </p>

      <div className="mt-6 max-w-[64ch] border border-line p-5 text-sm leading-relaxed text-paper-dim">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-flame">
          De dónde sacar el enlace
        </p>
        <p>
          Subí el reel como <strong className="text-paper">Short</strong> a{" "}
          <a
            href={site.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="text-flame-warm transition-opacity hover:opacity-70"
          >
            tu canal de YouTube
          </a>
          , abrilo y copiá la dirección de la barra del navegador. Sirve
          cualquiera de estas formas:
        </p>
        <ul className="mt-3 space-y-1 font-mono text-xs text-paper-faint">
          <li>youtube.com/shorts/XXXXXXXXXXX</li>
          <li>youtu.be/XXXXXXXXXXX</li>
          <li>youtube.com/watch?v=XXXXXXXXXXX</li>
        </ul>
        <p className="mt-3">
          El video tiene que estar <strong className="text-paper">público o no listado</strong>.
          Si está en privado, YouTube no lo deja reproducir fuera de su sitio.
        </p>
      </div>

      <div className="mt-10">
        <ReelsForm actuales={actuales} />
      </div>
    </div>
  );
}
