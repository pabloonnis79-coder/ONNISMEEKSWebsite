import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { BloqueCopiable } from "./copiar";
import { EJEMPLO, OPCIONALES, PLANTILLA, REGLAS } from "@/lib/formato-youtube";

export const metadata: Metadata = {
  title: "Cómo cargar un proyecto",
  robots: { index: false, follow: false },
};

export default function FormatoPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-paper-dim transition-colors hover:text-paper"
      >
        <ArrowLeftIcon size={15} weight="bold" />
        Volver al panel
      </Link>

      <h1 className="mt-8 font-display text-3xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
        Cómo cargar un proyecto
      </h1>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-dim">
        La descripción del video en YouTube <strong className="text-paper">es</strong>{" "}
        la página del proyecto. Lo que se escribe ahí se convierte solo en la
        ficha técnica, el relato, los créditos y los textos para redes. No hay
        que cargar nada dos veces.
      </p>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-faint">
        Si la descripción no tiene esta estructura el proyecto igual aparece,
        pero con el título y el video nada más.
      </p>

      <section className="mt-12 flex flex-col gap-5">
        <BloqueCopiable
          titulo="Plantilla para pegar en YouTube"
          texto={PLANTILLA}
          nota="Pegala en la descripción del video y completá los campos. Los que queden vacíos simplemente no se muestran."
        />

        <BloqueCopiable
          titulo="Un ejemplo completo, para ver cómo queda"
          texto={EJEMPLO}
          nota="Este mismo texto se prueba contra el sistema cada vez que se toca el código, así que es exactamente lo que el sitio sabe leer."
        />
      </section>

      <section className="mt-16">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Reglas
        </h2>

        <dl className="mt-6 flex flex-col">
          {REGLAS.map((r) => (
            <div key={r.titulo} className="border-t border-line py-5">
              <dt className="text-sm font-medium text-paper">{r.titulo}</dt>
              <dd className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-paper-dim">
                {r.texto}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Campos opcionales
        </h2>

        <dl className="mt-6 flex flex-col">
          {OPCIONALES.map((o) => (
            <div
              key={o.campo}
              className="flex flex-col gap-1 border-t border-line py-4 sm:flex-row sm:gap-6"
            >
              <dt className="w-[11rem] shrink-0 font-mono text-[12px] text-flame-warm">
                {o.campo}
              </dt>
              <dd className="text-sm leading-relaxed text-paper-dim">{o.para}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Lo que escribe la inteligencia artificial
        </h2>
        <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-paper-dim">
          Con el cliente y los servicios cargados, o con una descripción de más
          de 40 caracteres, el sistema redacta solo el resumen de la portada, el
          título y la descripción para Google, las palabras clave y los textos
          para publicar en LinkedIn, Instagram y Facebook.
        </p>
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-paper-faint">
          Sin esos datos no escribe nada, y es a propósito: si se le pide texto
          sin información, inventa o contesta «sin información disponible», y esa
          frase termina publicada en Google como descripción del proyecto.
        </p>
      </section>

      <section className="mt-14 border border-line p-6">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Cómo se prueba
        </h2>
        <ol className="mt-5 ml-4 list-decimal space-y-2 text-sm leading-relaxed text-paper-dim marker:text-paper-faint">
          <li>Editar la descripción de un solo video en YouTube con este formato.</li>
          <li>
            Volver al{" "}
            <Link href="/admin" className="text-flame-warm hover:opacity-70">
              panel
            </Link>{" "}
            y apretar <strong className="text-paper">Sincronizar</strong>.
          </li>
          <li>Abrir el proyecto y ver cómo quedó.</li>
        </ol>
        <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-paper-faint">
          Si algo salió mal se corrige la descripción y se sincroniza de nuevo.
          No se rompe nada: lo que se haya editado a mano desde el panel no se
          pisa.
        </p>
      </section>
    </div>
  );
}
