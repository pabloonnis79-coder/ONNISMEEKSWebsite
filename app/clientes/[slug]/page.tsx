import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project/project-card";
import { Reveal } from "@/components/ui/reveal";
import { ActionLink } from "@/components/ui/action";
import { JsonLd } from "@/components/json-ld";
import { getClientBySlug, getClients, getProjects } from "@/lib/db/projects";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { uniq } from "@/lib/utils";

export const revalidate = 600;

export async function generateStaticParams() {
  const clients = await getClients();
  return clients.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) return { title: "Cliente no encontrado" };

  return pageMetadata({
    title: client.name,
    description:
      client.story ?? `Proyectos audiovisuales realizados para ${client.name}.`,
    path: `/clientes/${client.slug}`,
  });
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [client, projects] = await Promise.all([
    getClientBySlug(slug),
    getProjects({ client: slug }, 60),
  ]);

  if (!client) notFound();

  const years = projects.map((p) => p.year).filter(Boolean) as number[];
  const services = uniq(projects.flatMap((p) => p.services));
  const span =
    years.length > 0
      ? years.length === 1 || Math.min(...years) === Math.max(...years)
        ? String(years[0])
        : `${Math.min(...years)} a ${Math.max(...years)}`
      : null;

  // Datos reales contados sobre los proyectos publicados, nada inventado.
  const stats = [
    { label: "Proyectos", value: String(projects.length) },
    span && { label: "Período", value: span },
    services.length > 0 && { label: "Servicios", value: String(services.length) },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Clientes", path: "/clientes" },
          { name: client.name, path: `/clientes/${client.slug}` },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pt-32 md:px-10 md:pt-40">
        <header className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {client.logoUrl && (
              <Image
                src={client.logoUrl}
                alt={client.name}
                width={220}
                height={64}
                className="mb-8 h-12 w-auto object-contain"
              />
            )}
            <h1 className="display font-display text-[11vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[9vw] lg:text-[5.6vw]">
              {client.name}
            </h1>
            {client.story && (
              <p className="mt-7 max-w-[54ch] text-base leading-relaxed text-paper-dim md:text-lg">
                {client.story}
              </p>
            )}
            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-sm font-medium text-flame-warm transition-opacity hover:opacity-70"
              >
                {client.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          <div className="lg:col-span-5 lg:pt-6">
            <dl className="grid grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-display text-4xl font-extrabold tracking-[-0.04em] text-paper md:text-5xl">
                    {stat.value}
                  </dd>
                  <dt className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>

            {services.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                  Servicios contratados
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {services.map((service) => (
                    <li
                      key={service}
                      className="rounded-full border border-line px-4 py-1.5 text-sm text-paper-dim"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </header>
      </div>

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        {projects.length === 0 ? (
          <div className="border border-line px-6 py-16 md:px-12">
            <p className="text-paper-dim">
              Todavía no hay proyectos publicados para este cliente.
            </p>
            <ActionLink href="/proyectos" variant="ghost" className="mt-6">
              Ver todo
            </ActionLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 md:gap-y-20">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={i % 2 === 1 ? 0.08 : 0}>
                <ProjectCard
                  project={project}
                  priority={i < 2}
                  size="sm"
                  sizes="(max-width: 768px) 100vw, 48vw"
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
