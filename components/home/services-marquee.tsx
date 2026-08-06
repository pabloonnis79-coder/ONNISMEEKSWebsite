import { BrandSquare } from "@/components/brand/wordmark";
import { services } from "@/lib/site";

/**
 * Tira de servicios en movimiento, entre el hero y los paneles. Cumple la
 * misma funcion que en la referencia: anticipa lo que viene y da un respiro
 * entre dos bloques de video.
 *
 * Es la unica marquesina de la pagina. Dos compiten entre si y ninguna se lee.
 */
export function ServicesMarquee() {
  const items = services.map((s) => s.name);
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Lo que hacemos"
      className="border-y border-line bg-ink-800 py-6 md:py-8"
    >
      <div className="edge-fade-x overflow-hidden">
        <div
          className="marquee-track flex w-max items-center"
          style={{ ["--marquee-duration" as string]: `${Math.max(34, items.length * 6)}s` }}
        >
          {loop.map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center" aria-hidden={i >= items.length}>
              <span className="whitespace-nowrap font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-paper md:text-3xl">
                {item}
              </span>
              <span className="mx-7 flex shrink-0 items-center md:mx-10">
                <BrandSquare size={12} />
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
