import { ActionLink } from "@/components/ui/action";
import { getTextos } from "@/lib/db/textos";

export default async function NotFound() {
  const t = await getTextos();

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[1600px] flex-col justify-center px-5 py-32 md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
        {t["error404.antetitulo"]}
      </p>
      <h1 className="display mt-6 max-w-[16ch] font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[9vw] lg:text-[min(5.4vw,86.4px)]">
        {t["error404.titulo"]}
      </h1>
      <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-paper-dim">
        {t["error404.texto"]}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ActionLink href="/proyectos" arrow>
          Ver proyectos
        </ActionLink>
        <ActionLink href="/" variant="ghost">
          Volver al inicio
        </ActionLink>
      </div>
    </div>
  );
}
