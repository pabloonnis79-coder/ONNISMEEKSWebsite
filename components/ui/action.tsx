import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

const base =
  "group inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-[13px] font-semibold uppercase tracking-[0.12em] transition duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98]";

const variants: Record<Variant, string> = {
  // Degrade naranja con texto casi negro: contraste alto en los dos extremos.
  primary: "flame-bg text-ink hover:brightness-110",
  ghost:
    "border border-line text-paper hover:border-flame-warm hover:text-flame-warm",
};

export function ActionLink({
  href,
  children,
  variant = "primary",
  arrow = false,
  className,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  const external = href.startsWith("http") || href.startsWith("mailto:");

  const content = (
    <>
      {children}
      {arrow && (
        <ArrowUpRightIcon
          size={15}
          weight="bold"
          className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, variants[variant], className)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
      {content}
    </Link>
  );
}

/** Enlace de texto con subrayado que crece desde la izquierda. */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-1.5 text-sm font-medium text-paper transition-colors hover:text-flame-warm",
        className,
      )}
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-flame-warm transition-transform duration-400 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
      </span>
      <ArrowUpRightIcon
        size={13}
        weight="bold"
        className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
