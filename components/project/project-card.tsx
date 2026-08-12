import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { CoverPlayer } from "@/components/project/cover-player";
import { Tilt } from "@/components/ui/tilt";
import type { Project } from "@/lib/types";
import { cn, formatDuration, youtubeThumb } from "@/lib/utils";

export function ProjectCard({
  project,
  priority = false,
  size = "md",
  sizes,
  auto = false,
}: {
  project: Project;
  priority?: boolean;
  /** "reel" es la grilla densa y pareja del listado: todo en 16:9. */
  size?: "reel" | "sm" | "md" | "lg";
  sizes?: string;
  /** Reproduce el video al entrar en pantalla, sin esperar al cursor. */
  auto?: boolean;
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
      <Tilt>
        <div
          className={cn(
            "relative w-full overflow-hidden",
            size === "lg"
              ? "aspect-[16/10]"
              : size === "reel"
                ? "aspect-video"
                : size === "sm"
                  ? "aspect-[4/3]"
                  : "aspect-[3/2]",
          )}
        >
          <CoverPlayer
            youtubeId={project.youtubeId}
            poster={poster}
            alt={`${title}${project.clientName ? ` para ${project.clientName}` : ""}`}
            duracion={duration}
            priority={priority}
            auto={auto}
            sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
          />
        </div>
      </Tilt>

      <div
        className={cn(
          "flex items-start justify-between gap-6",
          size === "reel" ? "pt-3.5" : "pt-5",
        )}
      >
        <div className="min-w-0">
          <h3
            className={cn(
              "font-display font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-paper transition-colors duration-300 group-hover:text-flame-warm",
              size === "lg"
                ? "text-2xl md:text-4xl"
                : size === "reel"
                  ? "text-base md:text-lg"
                  : "text-xl md:text-2xl",
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-paper-dim",
              size === "reel" ? "mt-1.5 text-[13px]" : "mt-2 text-sm",
            )}
          >
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
