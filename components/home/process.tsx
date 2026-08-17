import { ProcessSteps } from "@/components/home/process-steps";

export type PasoProceso = { verb: string; body: string };

export function Process({
  titulo,
  bajada,
  steps,
}: {
  titulo: string;
  bajada: string;
  steps: PasoProceso[];
}) {
  /*
    El titular va en dos lineas, cortando por el ultimo espacio. Se calcula acá
    y no se pide como dos campos separados: quien escribe "Cómo trabajamos" no
    tiene por que pensar donde corta la linea.
  */
  const corte = titulo.trim().lastIndexOf(" ");
  const primera = corte > 0 ? titulo.slice(0, corte) : titulo;
  const segunda = corte > 0 ? titulo.slice(corte + 1) : "";

  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-12 lg:gap-16">
        {/*
          min-w-0 en las dos columnas. Sin eso, un hijo de grilla usa
          min-width:auto y un titular ancho ensancha su columna mas alla de lo
          que le toca: "PENSAR" terminaba montado sobre "CÓMO TRABAJAMOS".
        */}
        <div className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="display font-display text-[11vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[8vw] lg:text-[min(3.6vw,57.6px)]">
              {primera}
              {segunda && (
                <>
                  <br />
                  {segunda}
                </>
              )}
            </h2>
            <p className="mt-6 max-w-[38ch] text-sm leading-relaxed text-paper-dim">
              {bajada}
            </p>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <ProcessSteps steps={steps} />
        </div>
      </div>
    </section>
  );
}
