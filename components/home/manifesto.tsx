import { Reveal } from "@/components/ui/reveal";

export function Manifesto() {
  return (
    <section className="border-y border-line bg-ink-800">
      <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <Reveal>
          <p className="display max-w-[22ch] font-display text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.045em] text-paper sm:max-w-[24ch] sm:text-[7vw] lg:text-[min(4.6vw,73.6px)]">
            Un rodaje bien pensado se nota{" "}
            <span className="flame-text">tres años después</span>.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-10 max-w-[58ch] text-base leading-relaxed text-paper-dim md:mt-14 md:text-lg">
            Trabajamos con equipos de marketing que ya saben lo que quieren decir
            y necesitan que se vea bien dicho. Definimos el plan con el
            presupuesto sobre la mesa, filmamos con el equipo justo y entregamos
            todas las versiones que pide cada canal.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
