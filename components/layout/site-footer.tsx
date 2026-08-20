import Link from "next/link";
import { BrandSquare } from "@/components/brand/wordmark";
import { fullNav, site } from "@/lib/site";

const socials = [
  { label: "Instagram", href: site.social.instagram },
  { label: "YouTube", href: site.social.youtube },
  { label: "LinkedIn", href: site.social.linkedin },
];

export function SiteFooter({ ocultas = [] }: { ocultas?: string[] }) {
  const indice = fullNav.filter((item) => !ocultas.includes(item.href));

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink">
      {/*
        El pie termina mas abajo de lo que haria falta, a proposito: el boton de
        WhatsApp queda fijo en la esquina y, al llegar al final de la pagina, se
        montaba sobre la ultima linea. Este espacio le reserva el lugar. Sale de
        la medida real del boton, 56 px de alto, mas su separacion del borde.
      */}
      <div className="mx-auto max-w-[1600px] px-5 pb-28 pt-16 md:px-10 md:pb-32 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="display font-display text-[10.5vw] font-extrabold uppercase leading-[0.85] tracking-[-0.045em] text-paper sm:text-[9vw] lg:text-[min(5.4vw,86.4px)]">
              Onnis
              <span className="flame-text">&amp;</span>
              Meeks
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper-dim">
              {site.description}
            </p>
          </div>

          <nav aria-label="Pie de página" className="lg:col-span-3">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint">
              Sitio
            </p>
            <ul className="space-y-2.5">
              {indice.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-paper-dim transition-colors hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint">
              Escribinos
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-paper transition-colors hover:text-flame-warm"
                >
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${site.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper-dim transition-colors hover:text-paper"
                >
                  {site.contact.phone}
                </a>
              </li>
              <li className="text-paper-dim">{site.contact.city}</li>
            </ul>

            <ul className="mt-7 space-y-2.5 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-paper-dim transition-colors hover:text-paper"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-7 text-xs text-paper-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            {year} {site.legalName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <BrandSquare size={12} />
            <span className="font-mono uppercase tracking-[0.2em]">
              {site.tagline}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
