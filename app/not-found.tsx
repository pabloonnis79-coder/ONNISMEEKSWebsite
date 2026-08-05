import { ActionLink } from "@/components/ui/action";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[1600px] flex-col justify-center px-5 py-32 md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
        Error 404
      </p>
      <h1 className="display mt-6 max-w-[16ch] font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[9vw] lg:text-[5.4vw]">
        Esta página no existe
      </h1>
      <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-paper-dim">
        Puede que el proyecto haya cambiado de dirección o que el enlace esté
        incompleto.
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
