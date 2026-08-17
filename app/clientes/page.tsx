import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { JsonLd } from "@/components/json-ld";
import { getClients, getFacets } from "@/lib/db/projects";
import { getTextos } from "@/lib/db/textos";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: "Clientes",
  description:
    "Marcas, organizaciones y agencias con las que trabajamos. Cada cliente tiene su ficha con todos los proyectos realizados.",
  path: "/clientes",
});

export default async function ClientsPage() {
  const [clients, facets, t] = await Promise.all([
    getClients(),
    getFacets(),
    getTextos(),
  ]);
  const counts = new Map(facets.clients.map((c) => [c.slug, c.count]));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Clientes", path: "/clientes" },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40">
        <header className="mb-14 md:mb-20">
          <h1 className="display font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[11vw] lg:text-[min(7vw,112px)]">
            {t["clientes.titulo"]}
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-paper-dim md:text-lg">
            {t["clientes.bajada"]}
          </p>
        </header>

        {clients.length === 0 ? (
          <p className="border border-line px-6 py-16 text-paper-dim md:px-12">
            {t["clientes.vacio"]}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client, i) => (
              <li key={client.id} className="bg-ink">
                <Reveal delay={(i % 3) * 0.05}>
                  <Link
                    href={`/clientes/${client.slug}`}
                    className="group flex h-full min-h-[220px] flex-col justify-between gap-6 p-7 transition-colors duration-300 hover:bg-ink-800 md:p-9"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {client.logoUrl ? (
                        <Image
                          src={client.logoUrl}
                          alt={client.name}
                          width={140}
                          height={40}
                          className="h-8 w-auto object-contain"
                        />
                      ) : (
                        <h2 className="font-display text-2xl font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-paper transition-colors duration-300 group-hover:text-flame-warm md:text-3xl">
                          {client.name}
                        </h2>
                      )}
                      <ArrowUpRightIcon
                        size={18}
                        weight="bold"
                        className="mt-1 shrink-0 text-paper-faint transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-flame-warm"
                      />
                    </div>

                    <div>
                      {client.story && (
                        <p className="mb-4 max-w-[38ch] text-sm leading-relaxed text-paper-dim">
                          {client.story}
                        </p>
                      )}
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                        {counts.get(client.slug) ?? 0}{" "}
                        {(counts.get(client.slug) ?? 0) === 1 ? "proyecto" : "proyectos"}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
