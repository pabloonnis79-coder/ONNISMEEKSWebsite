import Image from "next/image";
import type { Marca } from "@/lib/db/settings";

/**
 * Carrusel de logos de las marcas con las que trabajamos.
 *
 * Los logos se cargan desde el panel. Van en escala de grises y recuperan el
 * color al pasar el cursor: un muro de logos a todo color se come la atencion
 * y compite con el trabajo, que es lo que importa en la portada.
 *
 * Es la segunda tira en movimiento de la pagina, pero no compite con la de
 * servicios: aquella es tipografia gigante y esta son logos chicos.
 */
export function BrandCarousel({ marcas }: { marcas: Marca[] }) {
  if (marcas.length === 0) return null;

  // Con pocas marcas el ciclo se nota; se repite hasta tener recorrido.
  const base = marcas.length >= 6 ? marcas : [...marcas, ...marcas, ...marcas];
  const loop = [...base, ...base];

  return (
    <section
      aria-label="Marcas con las que trabajamos"
      className="border-y border-line py-10 md:py-14"
    >
      <p className="mx-auto mb-8 max-w-[1600px] px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-faint md:px-10">
        Confían en nosotros
      </p>

      <div className="edge-fade-x overflow-hidden">
        <div
          className="marquee-track flex w-max items-center gap-14 md:gap-20"
          style={{ ["--marquee-duration" as string]: `${Math.max(30, base.length * 5)}s` }}
        >
          {loop.map((marca, i) => {
            const contenido = marca.logo ? (
              <Image
                src={marca.logo}
                alt={marca.nombre}
                width={200}
                height={80}
                quality={90}
                className="h-8 w-auto object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 md:h-10"
              />
            ) : (
              // Sin logo cargado, el nombre sostiene el lugar.
              <span className="whitespace-nowrap font-display text-lg font-extrabold uppercase tracking-[-0.02em] text-paper/60 transition-colors duration-300 hover:text-paper md:text-xl">
                {marca.nombre}
              </span>
            );

            return (
              <div
                key={`${marca.nombre}-${i}`}
                className="shrink-0"
                aria-hidden={i >= base.length}
              >
                {marca.sitio ? (
                  <a
                    href={marca.sitio}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={marca.nombre}
                  >
                    {contenido}
                  </a>
                ) : (
                  contenido
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
