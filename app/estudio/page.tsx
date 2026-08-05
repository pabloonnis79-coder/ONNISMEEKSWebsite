import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { ActionLink } from "@/components/ui/action";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { capabilities, site } from "@/lib/site";
import { team } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Estudio",
  description:
    "Quiénes somos, cómo trabajamos y con qué equipo. Productora audiovisual con proceso completo puertas adentro.",
  path: "/estudio",
});

export default function StudioPage() {
  const years = new Date().getFullYear() - site.foundingYear;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Estudio", path: "/estudio" },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pt-32 md:px-10 md:pt-40">
        <h1 className="display max-w-[18ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[9vw] lg:text-[6vw]">
          Un estudio, <span className="flame-text">todo el proceso</span>
        </h1>
      </div>

      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="space-y-6 text-base leading-relaxed text-paper-dim md:text-lg">
              <p className="max-w-[62ch]">
                ONNIS &amp; MEEKS trabaja desde {site.foundingYear} produciendo
                piezas audiovisuales para marcas, organizaciones y agencias. En{" "}
                {years} años armamos un equipo que cubre todas las etapas, desde
                la idea hasta el archivo final entregado.
              </p>
              <p className="max-w-[62ch]">
                No tercerizamos las decisiones importantes. La misma persona que
                escucha el brief está en el rodaje y firma el corte final. Eso
                hace que la pieza que se aprueba sea la pieza que se entrega.
              </p>
              <p className="max-w-[62ch]">
                Trabajamos con presupuesto cerrado. Si algo no entra, lo decimos
                antes de firmar y proponemos cómo resolverlo de otra manera.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-700">
              {/* TODO: reemplazar por una foto real del equipo en rodaje. */}
              <Image
                src="https://picsum.photos/seed/om-estudio/1000/1250"
                alt="Equipo de ONNIS & MEEKS durante un rodaje"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-800">
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
            Lo que producimos
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item, i) => (
              <li key={item}>
                <Reveal delay={(i % 4) * 0.05}>
                  <p className="display border-t border-line py-5 font-display text-2xl font-extrabold uppercase tracking-[-0.035em] text-paper md:text-3xl">
                    {item}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {team.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
          <h2 className="display font-display text-[10vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6.5vw] lg:text-[4vw]">
            Equipo
          </h2>
          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {team.map((member) => (
              <li key={member.name}>
                {member.photo && (
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-700">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="mt-4 font-display text-lg font-extrabold uppercase tracking-[-0.02em]">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm text-paper-dim">{member.role}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-10 md:py-28">
          <h2 className="display max-w-[18ch] font-display text-[10vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[6.5vw] lg:text-[4vw]">
            Contanos qué hay que filmar
          </h2>
          <ActionLink href="/contacto" arrow className="self-start">
            Contacto
          </ActionLink>
        </div>
      </section>
    </>
  );
}
