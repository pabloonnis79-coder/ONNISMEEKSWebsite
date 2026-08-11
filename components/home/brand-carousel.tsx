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

/** Altura del logo al tamano normal. El selector del panel multiplica esto. */
const ALTO_BASE = 32;
const ALTO_BASE_MD = 40;

/** Separacion entre logos, tambien proporcional al tamano elegido. */
const SEPARACION = 56;
const SEPARACION_MD = 80;

/** Ancho minimo de una vuelta. Debajo de esto se repite mas veces la lista. */
const RECORRIDO_MINIMO = 2600;

export function BrandCarousel({
  marcas,
  escala = 1,
}: {
  marcas: Marca[];
  escala?: number;
}) {
  if (marcas.length === 0) return null;

  const alto = Math.round(ALTO_BASE * escala);
  const altoMd = Math.round(ALTO_BASE_MD * escala);
  const separacion = Math.round(SEPARACION * escala);
  const separacionMd = Math.round(SEPARACION_MD * escala);

  /**
   * Cuantas veces repetir la lista para que una vuelta sea mas larga que
   * cualquier pantalla. Si la tira fuera mas corta que el monitor se veria el
   * vacio entre el final y el principio, que es justo lo que no puede pasar.
   */
  const anchoAproximado = marcas.length * (altoMd * 3 + separacionMd);
  const repeticiones = Math.max(1, Math.ceil(RECORRIDO_MINIMO / anchoAproximado));

  const base = Array.from({ length: repeticiones }, () => marcas).flat();
  // Dos vueltas identicas: la animacion corre media tira y vuelve a empezar,
  // y como la segunda mitad es igual a la primera, el salto no se ve.
  const loop = [...base, ...base];

  return (
    <section
      aria-label="Marcas con las que trabajamos"
      className="border-y border-line py-10 md:py-14"
    >
      <p className="mx-auto mb-8 max-w-[1600px] px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-faint md:px-10">
        Confían en nosotros
      </p>

      <div
        className="edge-fade-x overflow-hidden"
        style={
          {
            "--logo-alto": `${alto}px`,
            "--logo-alto-md": `${altoMd}px`,
            "--logo-sep": `${separacion}px`,
            "--logo-sep-md": `${separacionMd}px`,
          } as React.CSSProperties
        }
      >
        {/*
          La separacion va como margen de cada logo y no como gap del contenedor.
          Con gap, el ancho de la tira es N logos mas N-1 espacios, asi que
          correr el 50% no equivale a una vuelta exacta: sobra medio espacio y
          en cada ciclo se ve un tironcito. Con margen, cada logo ocupa siempre
          lo mismo y las dos mitades son idénticas.
        */}
        <div
          className="marquee-track flex w-max items-center"
          style={{ ["--marquee-duration" as string]: `${Math.max(30, base.length * 5)}s` }}
        >
          {loop.map((marca, i) => {
            const contenido = marca.logo ? (
              <Image
                src={marca.logo}
                alt={marca.nombre}
                width={400}
                height={160}
                quality={90}
                className="logo-marca w-auto object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
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
                className="logo-hueco shrink-0"
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
