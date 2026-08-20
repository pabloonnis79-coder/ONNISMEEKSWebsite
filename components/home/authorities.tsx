import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { PortraitFocus } from "@/components/home/portrait-focus";
import type { Autoridad } from "@/lib/db/settings";

/**
 * Autoridades del estudio: foto circular, nombre y cargo.
 *
 * Se cargan desde el panel. Si no hay ninguna, la seccion no se renderiza:
 * es preferible que no aparezca a que aparezca vacia o con gente inventada.
 */
export function Authorities({
  people,
  titulo,
}: {
  people: Autoridad[];
  titulo: string;
}) {
  if (people.length === 0) return null;

  /*
    La grilla se dibuja con el doble de columnas de las que se ven y cada
    persona ocupa dos.

    Es para poder centrar la ultima fila cuando queda incompleta. Con cinco en
    una grilla de tres, las dos de abajo se apoyan a la izquierda y la fila
    queda coja; con el doble de columnas, media columna de corrimiento existe y
    esas dos se pueden mandar al medio. El ancho de cada persona no cambia: dos
    columnas mas la separacion del medio miden exactamente lo mismo que una
    columna de la grilla simple.
  */
  const columnas = people.length % 4 === 0 ? 4 : 3;
  const sobran = people.length % columnas;

  // Desde donde arranca la ultima fila para quedar centrada.
  const ARRANQUE: Record<number, string> = {
    2: "lg:col-start-2",
    3: "lg:col-start-3",
    4: "lg:col-start-4",
  };

  const arranqueLargo = sobran === 0 ? null : ARRANQUE[columnas - sobran + 1];
  const primeraDeLaUltimaFila = people.length - sobran;

  // Lo mismo en pantallas medianas, donde la grilla es de dos.
  const arranqueMedio = people.length % 2 === 1 ? "sm:col-start-2" : null;

  return (
    <section
      aria-label="Autoridades"
      className="border-t border-line bg-ink-800"
    >
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <h2 className="display max-w-[14ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[7vw] lg:text-[min(4.4vw,70.4px)]">
          {titulo}
        </h2>

        {/*
          Las columnas siguen a la cantidad de personas: con cuatro en una
          grilla de tres, la cuarta queda sola en una fila entera y parece un
          error de carga.
        */}
        <PortraitFocus>
          <ul
            className={`mt-14 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-4 md:mt-20 ${
              columnas === 4 ? "lg:grid-cols-8" : "lg:grid-cols-6"
            }`}
          >
            {people.map((person, i) => (
              <li
                key={`${person.nombre}-${person.apellido}-${i}`}
                className={`sm:col-span-2 lg:col-span-2 ${
                  i === people.length - 1 && arranqueMedio ? arranqueMedio : ""
                } ${i === primeraDeLaUltimaFila && arranqueLargo ? arranqueLargo : ""}`}
              >
                <Reveal delay={(i % columnas) * 0.08}>
                  <figure className="retrato group flex flex-col items-center text-center">
                    <div className="relative aspect-square w-full max-w-[280px] rounded-full bg-ink-700">
                      <span aria-hidden="true" className="retrato-anillo" />
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        {person.foto ? (
                          <Image
                            src={person.foto}
                            alt={`${person.nombre} ${person.apellido}`.trim()}
                            fill
                            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 280px"
                            quality={90}
                            className="retrato-foto object-cover"
                          />
                        ) : (
                          // Sin foto cargada, las iniciales sostienen el circulo.
                          <span className="flex h-full w-full items-center justify-center font-display text-5xl font-extrabold uppercase text-paper-faint transition-colors duration-500 group-hover:text-paper">
                            {(person.nombre[0] ?? "") +
                              (person.apellido[0] ?? "")}
                          </span>
                        )}
                      </span>
                    </div>

                    <figcaption className="mt-7">
                      <p className="font-display text-2xl font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-paper md:text-3xl">
                        {person.nombre}
                        {person.apellido && (
                          <>
                            <br />
                            {person.apellido}
                          </>
                        )}
                      </p>
                      {person.cargo && (
                        <p className="retrato-cargo mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-flame group-hover:text-flame-warm">
                          {person.cargo}
                        </p>
                      )}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        </PortraitFocus>
      </div>
    </section>
  );
}
