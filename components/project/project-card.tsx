import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { HoverVideo } from "@/components/media/hover-video";
import type { Project } from "@/lib/types";
import { cn, formatDuration, youtubeThumb } from "@/lib/utils";

export function ProjectCard({
  project,
  priority = false,
  size = "md",
  sizes,
}: {
  project: Project;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  sizes?: string;
}) {
  const poster =
    project.coverUrl ?? (project.youtubeId ? youtubeThumb(project.youtubeId) : null);

  const title = project.projectName ?? project.title;
  const duration = formatDuration(project.durationSeconds);

  return (
    <Link
      href={`/proyectos/${project.slug}`}
      className="group block focus-visible:outline-offset-8"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          size === "lg" ? "aspect-[16/10]" : size === "sm" ? "aspect-[4/3]" : "aspect-[3/2]",
        )}
      >
        <HoverVideo
          youtubeId={project.youtubeId}
          poster={poster}
          alt={`${title}${project.clientName ? ` para ${project.clientName}` : ""}`}
          priority={priority}
          sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
        />

        <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 flame-bg transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
      </div>

      <div className="flex items-start justify-between gap-6 pt-5">
        <div className="min-w-0">
          <h3
            className={cn(
              "font-display font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-paper transition-colors duration-300 group-hover:text-flame-warm",
              size === "lg" ? "text-2xl md:text-4xl" : "text-xl md:text-2xl",
            )}
          >
            {title}
          </h3>
          <p className="mt-2 text-sm text-paper-dim">
            {[project.clientName, project.category].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 pt-1">
          <span className="font-mono text-xs text-paper-faint">
            {duration || project.year || ""}
          </span>
          <ArrowUpRightIcon
            size={18}
            weight="bold"
            className="text-paper-faint transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-flame-warm"
          />
        </div>
      </div>
    </Link>
  );
}
