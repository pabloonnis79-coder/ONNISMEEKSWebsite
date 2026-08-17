import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { ActionLink } from "@/components/ui/action";
import { BrandSquare } from "@/components/brand/wordmark";
import { JsonLd } from "@/components/json-ld";
import { getFeaturedProjects } from "@/lib/db/projects";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { getTextos } from "@/lib/db/textos";
import { team } from "@/lib/content";

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: "Estudio: quiénes somos y cómo trabajamos",
  description:
    "Quiénes somos, cómo trabajamos y con qué equipo. Productora audiovisual con proceso completo puertas adentro.",
  path: "/estudio",
});

export default async function StudioPage() {
  const years = new Date().getFullYear() - site.foundingYear;
  const t = await getTextos();

  /*
    Los parrafos admiten {año} y {años}. Se reemplazan al mostrar y no al
    guardar: asi el numero de años se actualiza solo cada primero de enero, en
    vez de quedar congelado en el que habia el dia que se escribio el texto.
  */
  const conDatos = (texto: string) =>
    texto
      .replaceAll("{año}", String(site.foundingYear))
      .replaceAll("{años}", String(years));

  // Parte del titulo va en naranja: se busca dentro, igual que en la portada.
  const tituloEstudio = t["estudio.titulo"];
  const resaltado = t["estudio.resaltado"].trim();
  const corte = resaltado ? tituloEstudio.indexOf(resaltado) : -1;

  const capacidades = t["estudio.capacidades.items"]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const [ultimo] = await getFeaturedProjects(1);
  const portada = ultimo?.coverUrl
    ? {
        cover: ultimo.coverUrl,
        titulo: ultimo.projectName ?? ultimo.title,
        slug: ultimo.slug,
      }
    : null;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Estudio", path: "/estudio" },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pt-32 md:px-10 md:pt-40">
        <h1 className="display max-w-[18ch] font-display text-[11vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[9vw] lg:text-[min(6vw,96px)]">
          {corte < 0 ? (
            tituloEstudio
          ) : (
            <>
              {tituloEstudio.slice(0, corte)}
              <span className="flame-text">{resaltado}</span>
              {tituloEstudio.slice(corte + resaltado.length)}
            </>
          )}
        </h1>
      </div>

      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="space-y-6 text-base leading-relaxed text-paper-dim md:text-lg">
              <p className="max-w-[62ch]">{conDatos(t["estudio.parrafo1"])}</p>
              <p className="max-w-[62ch]">{conDatos(t["estudio.parrafo2"])}</p>
              <p className="max-w-[62ch]">{conDatos(t["estudio.parrafo3"])}</p>
            </div>
          </div>

          <div className="lg:col-span-5">
            {/*
              Se muestra el ultimo trabajo publicado en lugar de una foto de
              stock. Es material real del estudio y se actualiza solo.
            */}
            {portada ? (
              <Link
                href={`/proyectos/${portada.slug}`}
                className="group block"
                aria-label={`Ver ${portada.titulo}`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-800">
                  <Image
                    src={portada.cover}
                    alt={portada.titulo}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    quality={90}
                    className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent"
                  />
                </div>
                <p className="mt-4 text-sm text-paper-dim transition-colors group-hover:text-flame-warm">
                  {portada.titulo}
                </p>
              </Link>
            ) : (
              <div className="flex aspect-[4/5] w-full flex-col justify-between border border-line p-8">
                <BrandSquare size={28} />
                <p className="display font-display text-[7vw] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-paper lg:text-[min(2.6vw,41.6px)]">
                  Desde {site.foundingYear}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-800">
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
            {t["estudio.capacidades.titulo"]}
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            {capacidades.map((item, i) => (
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
          <h2 className="display font-display text-[10vw] font-extrabold uppercase tracking-[-0.045em] sm:text-[6.5vw] lg:text-[min(4vw,64px)]">
            {t["estudio.equipo.titulo"]}
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
          <h2 className="display max-w-[18ch] font-display text-[10vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[6.5vw] lg:text-[min(4vw,64px)]">
            {t["estudio.cierre.titulo"]}
          </h2>
          <ActionLink href="/contacto" arrow className="self-start">
            {t["estudio.cierre.enlace"]}
          </ActionLink>
        </div>
      </section>
    </>
  );
}
