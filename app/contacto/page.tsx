import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { JsonLd } from "@/components/json-ld";
import { getTextos } from "@/lib/db/textos";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contacto",
  description:
    "Contanos qué hay que filmar. Respondemos dentro de las 48 horas hábiles con una primera propuesta.",
  path: "/contacto",
});

export default async function ContactPage() {
  const t = await getTextos();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Contacto", path: "/contacto" },
        ])}
      />

      <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h1 className="display font-display text-[11vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[9vw] lg:text-[min(4.6vw,73.6px)]">
              {t["contacto.titulo"]}
            </h1>
            <p className="mt-7 max-w-[42ch] text-base leading-relaxed text-paper-dim md:text-lg">
              {t["contacto.bajada"]}
            </p>

            <dl className="mt-12 space-y-7">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                  Correo
                </dt>
                <dd className="mt-2">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="text-lg text-paper transition-colors hover:text-flame-warm"
                  >
                    {site.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                  WhatsApp
                </dt>
                <dd className="mt-2">
                  <a
                    href={`https://wa.me/${site.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-paper transition-colors hover:text-flame-warm"
                  >
                    {site.contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                  Dónde estamos
                </dt>
                <dd className="mt-2 text-lg text-paper">{site.contact.city}</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
