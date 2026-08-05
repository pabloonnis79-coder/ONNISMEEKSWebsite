import { cn } from "@/lib/utils";

/**
 * Marca tipografica del estudio. El cuadrado con degrade naranja es el unico
 * elemento grafico de la identidad, asi que se dibuja como SVG para que escale
 * limpio y siga el color del sistema.
 */
export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const type = {
    sm: "text-[13px] leading-[0.9]",
    md: "text-[15px] leading-[0.9]",
    lg: "text-[22px] leading-[0.9]",
  }[size];

  const mark = { sm: 14, md: 16, lg: 24 }[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "font-display font-extrabold uppercase tracking-[-0.03em] text-paper",
          type,
        )}
      >
        Onnis&amp;Meeks
      </span>
      <BrandSquare size={mark} />
    </span>
  );
}

export function BrandSquare({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="om-flame" x1="0" y1="16" x2="16" y2="0">
          <stop offset="0%" stopColor="#d1490b" />
          <stop offset="50%" stopColor="#f26a1b" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <rect
        x="1.25"
        y="1.25"
        width="13.5"
        height="13.5"
        stroke="url(#om-flame)"
        strokeWidth="2.5"
      />
    </svg>
  );
}
