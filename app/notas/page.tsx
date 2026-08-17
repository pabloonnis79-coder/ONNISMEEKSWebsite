import type { Metadata } from "next";
import Image from "next/image";
import { ActionLink } from "@/components/ui/action";
import { Reveal } from "@/components/ui/reveal";
import { JsonLd } from "@/components/json-ld";
import { getTextos } from "@/lib/db/textos";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { posts } from "@/lib/content";
import { formatDateEs } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Notas de producción audiovisual",
  description:
    "Apuntes de producción, decisiones técnicas y casos de estudio del equipo.",
  path: "/notas",
});

export default async function NotesPage() {
  const t = await getTextos();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Notas", path: "/notas" },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40">
        <header className="mb-14 md:mb-20">
          <h1 className="display font-display text-[13vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[11vw] lg:text-[min(7vw,112px)]">
            {t["notas.titulo"]}
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-paper-dim md:text-lg">
            {t["notas.bajada"]}
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="border border-line px-6 py-16 md:px-12 md:py-24">
            <h2 className="max-w-[22ch] font-display text-2xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
              {t["notas.vacio.titulo"]}
            </h2>
            <p className="mt-5 max-w-[54ch] text-paper-dim">
              {t["notas.vacio.texto"]}
            </p>
            <ActionLink href="/proyectos" variant="ghost" className="mt-8">
              Ver proyectos
            </ActionLink>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <li key={post.slug}>
                <Reveal delay={(i % 3) * 0.06}>
                  <article className="group">
                    {post.cover && (
                      <div className="relative mb-5 aspect-[3/2] w-full overflow-hidden bg-ink-700">
                        <Image
                          src={post.cover}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                      {formatDateEs(post.date)}, {post.readingMinutes} min
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-extrabold uppercase leading-[0.98] tracking-[-0.035em] text-paper">
                      {post.title}
                    </h2>
                    <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-paper-dim">
                      {post.excerpt}
                    </p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
