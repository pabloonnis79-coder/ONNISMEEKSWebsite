import type { Metadata } from "next";
import Link from "next/link";
import { ActionLink } from "@/components/ui/action";
import { Reveal } from "@/components/ui/reveal";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { awards } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Premios",
  description:
    "Reconocimientos, selecciones oficiales y festivales donde participaron las piezas del estudio.",
  path: "/premios",
});

export default function AwardsPage() {
  // Se agrupa por año para que la lista no sea una tabla de filas iguales.
  const byYear = awards.reduce<Map<number, typeof awards>>((acc, award) => {
    const list = acc.get(award.year) ?? [];
    list.push(award);
    acc.set(award.year, list);
    return acc;
  }, new Map());

  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Premios", path: "/premios" },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40">
        <header className="mb-14 md:mb-20">
          <h1 className="display font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[11vw] lg:text-[min(7vw,112px)]">
            Premios
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-paper-dim md:text-lg">
            Festivales, selecciones oficiales y reconocimientos de la industria.
          </p>
        </header>

        {awards.length === 0 ? (
          <div className="border border-line px-6 py-16 md:px-12 md:py-24">
            <h2 className="max-w-[20ch] font-display text-2xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
              Esta sección todavía no tiene contenido cargado
            </h2>
            <p className="mt-5 max-w-[54ch] text-paper-dim">
              Los premios se cargan en{" "}
              <code className="font-mono text-sm text-flame-warm">lib/content.ts</code>{" "}
              y la página se arma sola, agrupada por año.
            </p>
            <ActionLink href="/proyectos" variant="ghost" className="mt-8">
              Ver proyectos
            </ActionLink>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
            {years.map((year) => (
              <Reveal key={year}>
                <div className="grid gap-6 md:grid-cols-12">
                  <h2 className="display font-display text-[14vw] font-extrabold uppercase leading-[0.85] tracking-[-0.05em] text-paper-faint sm:text-[8vw] md:col-span-3 lg:text-[min(4.4vw,70.4px)]">
                    {year}
                  </h2>

                  <ul className="md:col-span-9">
                    {byYear.get(year)!.map((award) => (
                      <li
                        key={`${award.name}-${award.category}`}
                        className="border-t border-line py-6 last:border-b"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                          <h3 className="font-display text-xl font-extrabold uppercase tracking-[-0.03em] text-paper md:text-2xl">
                            {award.name}
                          </h3>
                          <span className="rounded-full border border-flame px-3.5 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-flame-warm">
                            {award.result}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-paper-dim">
                          {award.organization}, {award.category}
                        </p>
                        {award.project && (
                          <p className="mt-1.5 text-sm">
                            {award.projectSlug ? (
                              <Link
                                href={`/proyectos/${award.projectSlug}`}
                                className="text-flame-warm transition-opacity hover:opacity-70"
                              >
                                {award.project}
                              </Link>
                            ) : (
                              <span className="text-paper-dim">{award.project}</span>
                            )}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
