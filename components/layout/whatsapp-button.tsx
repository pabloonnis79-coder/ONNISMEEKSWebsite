"use client";

import { usePathname } from "next/navigation";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { site } from "@/lib/site";

/**
 * Acceso directo a WhatsApp. Usa el degradé de la marca en lugar del verde de
 * la app: el ícono ya alcanza para que se entienda, y así el sitio mantiene un
 * solo color de acento.
 */
export function WhatsappButton() {
  const pathname = usePathname();

  // En el panel estorba y no aporta.
  if (pathname.startsWith("/admin")) return null;
  if (!site.contact.whatsapp) return null;

  const href = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
    site.contact.whatsappMessage,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribirnos por WhatsApp"
      className="group fixed bottom-5 right-5 z-[35] inline-flex h-14 items-center gap-0 overflow-hidden rounded-full flame-bg pl-[15px] pr-[15px] text-ink shadow-[0_10px_36px_rgba(0,0,0,0.45)] transition-all duration-500 ease-[var(--ease-out-expo)] hover:pr-6 focus-visible:pr-6 active:scale-95 md:bottom-8 md:right-8"
    >
      <WhatsappLogoIcon size={26} weight="fill" className="shrink-0" />
      <span className="max-w-0 whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.1em] opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:ml-2.5 group-hover:max-w-[10rem] group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-[10rem] group-focus-visible:opacity-100">
        WhatsApp
      </span>
    </a>
  );
}
