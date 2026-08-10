import { Reveal } from "@/components/ui/reveal";

const steps = [
  {
    verb: "Pensar",
    body: "Leemos el brief, discutimos el objetivo real y devolvemos un tratamiento con presupuesto cerrado. Si hay que cambiar la idea para que entre en el presupuesto, lo decimos antes y no después.",
  },
  {
    verb: "Filmar",
    body: "Plan de rodaje, equipo técnico y permisos a cargo nuestro. La marca aprueba la dirección de arte antes de que se encienda la primera luz.",
  },
  {
    verb: "Terminar",
    body: "Montaje, color, sonido y todas las versiones que necesita cada canal. Se entrega el máster y los archivos fuente, con los nombres ordenados.",
  },
];

export function Process() {
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
            <h2 className="display font-display text-[11vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[8vw] lg:text-[3.6vw]">
              Cómo
              <br />
              trabajamos
            </h2>
            <p className="mt-6 max-w-[38ch] text-sm leading-relaxed text-paper-dim">
              Tres momentos, un solo interlocutor. No hay reventa de servicios ni
              equipos que aparecen recién el día del rodaje.
            </p>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-8">
          {steps.map((step, i) => (
            <Reveal key={step.verb} delay={i * 0.06}>
              <div className="border-t border-line py-10 first:border-t-0 first:pt-0 md:py-14">
                <h3 className="display font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] text-paper sm:text-[9vw] lg:text-[5.6vw]">
                  {step.verb}
                </h3>
                <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-paper-dim">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
