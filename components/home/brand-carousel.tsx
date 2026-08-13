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
const SEPARACION = 34;
const SEPARACION_MD = 48;

/** Ancho minimo de una vuelta. Debajo de esto se repite mas veces la lista. */
const RECORRIDO_MINIMO = 2600;

/**
 * Relacion ancho/alto de la caja de cada logo.
 *
 * No es una estimacion: las medidas que se le pasan a la imagen fijan esta
 * proporcion para todos, y object-contain acomoda adentro el logo real sin
 * recortarlo. Por eso el ancho de una vuelta se puede calcular exacto, sin
 * medir el DOM. Verificado en el navegador: los doce logos miden lo mismo.
 */
const RELACION = 2.5;

/**
 * A que velocidad avanza la tira, en pixeles por segundo.
 *
 * Antes la duracion se calculaba por cantidad de logos, y eso daba al reves de
 * lo que uno espera: con doce marcas salian 60 segundos por vuelta, o sea 46
 * px/s, un arrastre tan lento que se lee como que la tira se quedo trabada.
 * Fijando la velocidad, agregar marcas alarga la vuelta pero no cambia el
 * ritmo, que es lo unico que se percibe.
 */
const VELOCIDAD = 90;

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

  // Lo que ocupa cada logo con su separacion, de punta a punta.
  const anchoItem = alto * RELACION + separacion;
  const anchoItemMd = altoMd * RELACION + separacionMd;

  /**
   * Cuantas veces repetir la lista para que una vuelta sea mas larga que
   * cualquier pantalla. Si la tira fuera mas corta que el monitor se veria el
   * vacio entre el final y el principio, que es justo lo que no puede pasar.
   */
  const vueltaMd = marcas.length * anchoItemMd;
  const repeticiones = Math.max(1, Math.ceil(RECORRIDO_MINIMO / vueltaMd));

  const base = Array.from({ length: repeticiones }, () => marcas).flat();
  // Dos vueltas identicas: la animacion corre media tira y vuelve a empezar,
  // y como la segunda mitad es igual a la primera, el salto no se ve.
  const loop = [...base, ...base];

  /*
    Dos duraciones, porque en el telefono los logos son mas chicos y una vuelta
    mide menos. Con un solo valor, la misma duracion sobre una tira mas corta
    daba la mitad de velocidad: en el telefono se arrastraba.
  */
  const duracion = Math.round((marcas.length * anchoItem * repeticiones) / VELOCIDAD);
  const duracionMd = Math.round((vueltaMd * repeticiones) / VELOCIDAD);

  /*
    Ancho al que se le pide cada logo. Sale del tamano elegido en el panel y no
    de un numero fijo: con un valor fijo, subir la escala pedia el mismo archivo
    chico y los logos salian borrosos, y bajarla descargaba de mas.
  */
  const anchoPedido = Math.round(altoMd * RELACION);

  return (
    /*
      bg-ink para que la tira corra sobre un fondo liso. Las lineas guia del
      layout son fijas y pasan por detras de todo; cruzando una fila de logos en
      movimiento se leen como rayas sucias sobre las marcas de los clientes, que
      es lo ultimo que uno quiere ensuciar.
    */
    <section
      aria-label="Marcas con las que trabajamos"
      className="relative border-y border-line bg-ink py-10 md:py-14"
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
          style={
            {
              "--marquee-duration": `${duracion}s`,
              "--marquee-duration-md": `${duracionMd}s`,
            } as React.CSSProperties
          }
        >
          {loop.map((marca, i) => {
            /*
              La imagen va sin prop sizes a proposito. Con sizes, Next arma el
              srcset con la lista de anchos de pantalla, y la opcion mas chica
              de esa lista es 640 px: estaba descargando imagenes de 640 para
              dibujar logos de 64. Sin sizes usa la lista de tamanos de imagen,
              que arranca en 16, y sirve el ancho que corresponde.
            */
            const contenido = marca.logo ? (
              <Image
                src={marca.logo}
                alt={marca.nombre}
                width={anchoPedido}
                height={altoMd}
                quality={90}
                draggable={false}
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
