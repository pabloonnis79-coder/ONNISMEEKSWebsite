import { Reveal } from "@/components/ui/reveal";
import { ManifestoGlow } from "@/components/home/manifesto-glow";

export function Manifesto() {
  return (
    /*
      relative y overflow-hidden por el resplandor: se posiciona contra esta
      seccion y no puede desbordar sobre las de al lado.
    */
    <section className="relative overflow-hidden border-y border-line bg-ink-800">
      <ManifestoGlow />

      {/* relative para que el texto quede por encima del resplandor. */}
      <div className="relative mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
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
