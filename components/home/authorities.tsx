import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
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

  const columnas = people.length % 4 === 0 ? 4 : 3;

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
          Las columnas siguen a la cantidad de personas. Con cuatro en una
          grilla de tres, la cuarta queda sola en una fila entera y parece un
          error de carga.
        */}
        <ul
          className={`mt-14 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 md:mt-20 ${
            columnas === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {people.map((person, i) => (
            <li key={`${person.nombre}-${person.apellido}-${i}`}>
              <Reveal delay={(i % columnas) * 0.08}>
                <figure className="flex flex-col items-center text-center">
                  <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-full bg-ink-700">
                    {person.foto ? (
                      <Image
                        src={person.foto}
                        alt={`${person.nombre} ${person.apellido}`.trim()}
                        fill
                        sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 280px"
                        quality={90}
                        className="object-cover"
                      />
                    ) : (
                      // Sin foto cargada, las iniciales sostienen el circulo.
                      <span className="flex h-full w-full items-center justify-center font-display text-5xl font-extrabold uppercase text-paper-faint">
                        {(person.nombre[0] ?? "") + (person.apellido[0] ?? "")}
                      </span>
                    )}
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
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-flame">
                        {person.cargo}
                      </p>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
