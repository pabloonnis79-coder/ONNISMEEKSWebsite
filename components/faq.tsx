import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/seo";

/**
 * Preguntas frecuentes: las que se ven y las que se declaran, del mismo texto.
 *
 * Declarar una pregunta que no esta a la vista en la pagina es motivo de
 * penalizacion. Con una sola fuente no se pueden separar: lo que se dibuja es
 * exactamente lo que se declara, y si alguien vacia una respuesta desde el
 * panel, esa pregunta desaparece de los dos lados a la vez.
 */

export type Pregunta = { pregunta: string; respuesta: string };

/**
 * Arma los pares desde el mapa de textos del panel.
 *
 * Una pregunta sin respuesta —o al reves— no sirve para nadie: no se muestra.
 */
export function armarPreguntas(t: Record<string, string>, cuantas = 6): Pregunta[] {
  return Array.from({ length: cuantas }, (_, i) => ({
    pregunta: (t[`faq.${i + 1}.pregunta`] ?? "").trim(),
    respuesta: (t[`faq.${i + 1}.respuesta`] ?? "").trim(),
  })).filter((p) => p.pregunta && p.respuesta);
}

export function Faq({
  preguntas,
  titulo = "Preguntas frecuentes",
  path,
}: {
  preguntas: Pregunta[];
  titulo?: string;
  /** La pagina donde viven, para que el dato estructurado tenga direccion. */
  path: string;
}) {
  if (preguntas.length === 0) return null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${absoluteUrl(path)}#faq`,
          mainEntity: preguntas.map((p) => ({
            "@type": "Question",
            name: p.pregunta,
            acceptedAnswer: { "@type": "Answer", text: p.respuesta },
          })),
        }}
      />

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
          <h2 className="display max-w-[16ch] font-display text-[10vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6.5vw] lg:text-[min(4vw,64px)]">
            {titulo}
          </h2>

          <dl className="mt-12 grid gap-x-16 gap-y-10 md:mt-16 md:grid-cols-2">
            {preguntas.map((p) => (
              <div key={p.pregunta} className="border-t border-line pt-6">
                {/*
                  La pregunta va en un encabezado de verdad y no en un parrafo
                  en negrita: es lo que hace que se pueda citar como pregunta.
                */}
                <dt>
                  <h3 className="font-display text-xl font-extrabold uppercase leading-[1.05] tracking-[-0.03em] text-paper md:text-2xl">
                    {p.pregunta}
                  </h3>
                </dt>
                <dd className="mt-3 max-w-[60ch] text-base leading-relaxed text-paper-dim">
                  {p.respuesta}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
