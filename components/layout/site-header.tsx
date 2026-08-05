"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useReducedMotion } from "motion/react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { Wordmark } from "@/components/brand/wordmark";
import { fullNav, primaryNav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 24);
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[var(--z-nav)] transition-colors duration-500",
          scrolled && !open
            ? "border-b border-line bg-ink/85 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-[72px] md:px-10">
          <Link
            href="/"
            aria-label={`${site.name}, inicio`}
            onClick={() => setOpen(false)}
            className="shrink-0"
          >
            <Wordmark />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-9 lg:flex">
            {primaryNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-1 text-[13px] font-medium tracking-wide transition-colors",
                    active ? "text-paper" : "text-paper-dim hover:text-paper",
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-0 h-px w-full flame-bg" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/contacto"
              className="hidden h-9 items-center rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm sm:inline-flex"
            >
              Contacto
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
            >
              {open ? <XIcon size={16} weight="bold" /> : <ListIcon size={16} weight="bold" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[var(--z-overlay)] bg-ink"
          >
            <div className="mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 pb-10 pt-24 md:px-10 md:pt-28">
              <nav aria-label="Índice del sitio">
                <ul>
                  {fullNav.map((item, i) => (
                    <li key={item.href} className="overflow-hidden border-b border-line">
                      <motion.div
                        initial={reduce ? false : { y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.7,
                          delay: 0.12 + i * 0.045,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-baseline gap-4 py-3 md:py-4"
                        >
                          <span className="font-mono text-[11px] text-paper-faint">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="display font-display text-[10vw] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-paper transition-colors duration-300 group-hover:text-flame md:text-[5.2vw]">
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex flex-col gap-4 pt-8 text-sm text-paper-dim md:flex-row md:items-end md:justify-between">
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-paper transition-colors hover:text-flame-warm"
                >
                  {site.contact.email}
                </a>
                <div className="flex gap-6">
                  <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-paper">
                    Instagram
                  </a>
                  <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-paper">
                    YouTube
                  </a>
                  <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-paper">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
