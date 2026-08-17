import { Reveal } from "@/components/ui/reveal";
import { ManifestoGlow } from "@/components/home/manifesto-glow";

/**
 * Parte de la frase va en naranja. El pedazo a resaltar se elige desde el
 * panel, y se busca dentro de la frase en vez de guardarse partida en dos: si
 * alguien reescribe la frase y no toca el resaltado, lo peor que pasa es que
 * no se resalte nada. Guardandola partida, en cambio, una mitad quedaria vieja.
 */
function partir(frase: string, resaltado: string) {
  const corte = resaltado.trim() ? frase.indexOf(resaltado.trim()) : -1;
  if (corte < 0) return { antes: frase, medio: "", despues: "" };

  return {
    antes: frase.slice(0, corte),
    medio: resaltado.trim(),
    despues: frase.slice(corte + resaltado.trim().length),
  };
}

export function Manifesto({
  titulo,
  resaltado,
  texto,
}: {
  titulo: string;
  resaltado: string;
  texto: string;
}) {
  const { antes, medio, despues } = partir(titulo, resaltado);

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
            {antes}
            {medio && <span className="flame-text">{medio}</span>}
            {despues}
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-10 max-w-[58ch] text-base leading-relaxed text-paper-dim md:mt-14 md:text-lg">
            {texto}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
