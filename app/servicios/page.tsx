import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { ActionLink } from "@/components/ui/action";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { capabilities, services, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Servicios",
  description:
    "Dirección, producción ejecutiva, fotografía, aéreas, post, color, sonido y fotografía de campaña. Todo el proceso en un mismo estudio.",
  path: "/servicios",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Servicios", path: "/servicios" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Servicios de ${site.name}`,
          itemListElement: services.map((service, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: service.name,
              description: service.summary,
              provider: { "@type": "Organization", name: site.name },
            },
          })),
        }}
      />

      <div className="mx-auto max-w-[1600px] px-5 pt-32 md:px-10 md:pt-40">
        <header className="max-w-[24ch]">
          <h1 className="display font-display text-[12vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[11vw] lg:text-[7vw]">
            Servicios
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-paper-dim md:text-lg">
            Trabajamos con equipo propio de punta a punta. Se puede contratar el
            proceso completo o entrar en la etapa que haga falta.
          </p>
        </header>
      </div>

      <section className="mx-auto mt-16 max-w-[1600px] px-5 md:mt-24 md:px-10">
        {services.map((service, i) => (
          <Reveal key={service.slug}>
            <article
              id={service.slug}
              className="grid scroll-mt-28 gap-6 border-t border-line py-10 md:grid-cols-12 md:gap-10 md:py-14"
            >
              <div className="md:col-span-5">
                <h2 className="display font-display text-[9vw] font-extrabold uppercase tracking-[-0.045em] text-paper sm:text-[6vw] lg:text-[3.4vw]">
                  {service.name}
                </h2>
              </div>

              <div className="md:col-span-4">
                <p className="max-w-[44ch] text-base leading-relaxed text-paper-dim">
                  {service.summary}
                </p>
              </div>

              <div className="md:col-span-3">
                <ul className="space-y-2">
                  {service.includes.map((item) => (
                    <li key={item} className="text-sm text-paper-dim">
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/proyectos?servicio=${encodeURIComponent(service.name)}`}
                  className="mt-5 inline-block text-sm font-medium text-flame-warm transition-opacity hover:opacity-70"
                >
                  Ver proyectos con {service.name.toLowerCase()}
                </Link>
              </div>
            </article>
            {i === services.length - 1 && <div className="border-t border-line" />}
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Formatos que producimos
        </h2>
        <ul className="mt-8 flex flex-wrap gap-3">
          {capabilities.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line px-5 py-2.5 text-sm text-paper-dim"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line bg-ink-800">
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
