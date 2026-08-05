"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { deleteProject, moveProject, setStatus, toggleField } from "./actions";
import { cn, youtubeThumb } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const iconButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-paper-dim transition-colors hover:border-paper-faint hover:text-paper disabled:opacity-30";

export function AdminRow({
  project,
  first,
  last,
}: {
  project: any;
  first: boolean;
  last: boolean;
}) {
  const [pending, start] = useTransition();

  const poster =
    project.cover_url ??
    (project.youtube_id ? youtubeThumb(project.youtube_id, "hq") : null);

  const title = project.project_name || project.title;

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-4 border-b border-line py-4 transition-opacity",
        pending && "opacity-50",
      )}
    >
      <div className="relative h-12 w-20 shrink-0 overflow-hidden bg-ink-700">
        {poster && (
          <Image src={poster} alt="" fill sizes="80px" className="object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/admin/proyectos/${project.id}`}
          className="block truncate text-sm font-semibold text-paper hover:text-flame-warm"
        >
          {title}
        </Link>
        <p className="truncate text-xs text-paper-faint">
          {[project.client_name, project.year, project.source === "manual" ? "manual" : "youtube"]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={project.featured ? "Quitar de destacados" : "Marcar como destacado"}
          aria-pressed={project.featured}
          onClick={() => start(() => void toggleField(project.id, "featured", !project.featured))}
          className={cn(iconButton, project.featured && "border-flame text-flame")}
        >
          <StarIcon size={15} weight={project.featured ? "fill" : "regular"} />
        </button>

        <button
          type="button"
          aria-label={project.hidden ? "Mostrar en el sitio" : "Ocultar del sitio"}
          aria-pressed={project.hidden}
          onClick={() => start(() => void toggleField(project.id, "hidden", !project.hidden))}
          className={cn(iconButton, project.hidden && "border-flame text-flame")}
        >
          {project.hidden ? <EyeSlashIcon size={15} /> : <EyeIcon size={15} />}
        </button>

        <button
          type="button"
          aria-label="Subir en el orden"
          disabled={first}
          onClick={() => start(() => void moveProject(project.id, "up"))}
          className={iconButton}
        >
          <ArrowUpIcon size={15} weight="bold" />
        </button>

        <button
          type="button"
          aria-label="Bajar en el orden"
          disabled={last}
          onClick={() => start(() => void moveProject(project.id, "down"))}
          className={iconButton}
        >
          <ArrowDownIcon size={15} weight="bold" />
        </button>

        <select
          aria-label="Estado de publicación"
          value={project.status}
          onChange={(e) =>
            start(() => void setStatus(project.id, e.target.value as "draft" | "published"))
          }
          className="h-9 rounded-full border border-line bg-ink-800 px-3 text-xs text-paper focus:border-flame focus:outline-none"
        >
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
        </select>

        <button
          type="button"
          aria-label={`Eliminar ${title}`}
          onClick={() => {
            if (!confirm(`Eliminar "${title}"? No se puede deshacer.`)) return;
            start(() => void deleteProject(project.id));
          }}
          className={cn(iconButton, "hover:border-flame hover:text-flame")}
        >
          <TrashIcon size={15} />
        </button>
      </div>
    </li>
  );
}
