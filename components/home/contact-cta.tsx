import { ActionLink } from "@/components/ui/action";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export function ContactCta() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-ink-800">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-[0.14] blur-[120px] flame-bg"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <Reveal>
          <h2 className="display max-w-[16ch] font-display text-[12vw] font-extrabold uppercase tracking-[-0.05em] sm:text-[8.5vw] lg:text-[min(5.6vw,89.6px)]">
            Contanos qué hay que filmar
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col gap-8 md:mt-16 md:flex-row md:items-center md:justify-between">
            <a
              href={`mailto:${site.contact.email}`}
              className="font-display text-2xl font-extrabold tracking-[-0.03em] text-paper transition-colors duration-300 hover:text-flame-warm md:text-4xl"
            >
              {site.contact.email}
            </a>
            <ActionLink href="/contacto" arrow>
              Contacto
            </ActionLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
