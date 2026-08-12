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
        {/*
          El piso de 38 s manda mientras haya pocos servicios; el factor por
          item toma el control si mañana la lista crece, para que una tira mas
          larga no pase mas rapido por pantalla.

          La separacion va como margen dentro de cada item y no como gap del
          contenedor: asi la tira mide exactamente N items y correr el 50%
          equivale a una vuelta justa. Con gap sobraria medio espacio y el
          ciclo daria un tironcito, que es lo que hubo que corregir en el
          carrusel de marcas.
        */}
        <div
          className="marquee-track flex w-max items-center"
          style={{ ["--marquee-duration" as string]: `${Math.max(38, items.length * 7)}s` }}
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
