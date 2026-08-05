"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { saveProject, type SaveState } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/browser";
import { slugify } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const initial: SaveState = { status: "idle" };

const field =
  "w-full border border-line bg-ink-800 px-4 py-2.5 text-sm text-paper placeholder:text-paper-dim focus:border-flame focus:outline-none";

function Label({ htmlFor, children, hint }: { htmlFor: string; children: string; hint?: string }) {
  return (
    <div className="mb-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-paper">
        {children}
      </label>
      {hint && <p className="mt-0.5 text-xs text-paper-faint">{hint}</p>}
    </div>
  );
}

function SaveBar({ state }: { state: SaveState }) {
  const { pending } = useFormStatus();

  return (
    <div className="sticky bottom-0 -mx-5 mt-10 flex flex-wrap items-center gap-4 border-t border-line bg-ink/95 px-5 py-4 backdrop-blur-md md:-mx-10 md:px-10">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center rounded-full flame-bg px-7 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 disabled:opacity-70"
      >
        {pending ? "Guardando" : "Guardar cambios"}
      </button>

      {state.message && (
        <p
          role="status"
          className={`text-sm ${state.status === "error" ? "text-flame-warm" : "text-paper-dim"}`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

export function EditForm({ project }: { project: any }) {
  const [state, formAction] = useActionState(saveProject, initial);
  const [gallery, setGallery] = useState<string>(
    (project.gallery ?? []).map((g: any) => g.url).join("\n"),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const supabase = createClient();
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const path = `proyectos/${project.slug}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });

      if (error) {
        setUploadError(`No se pudo subir ${file.name}: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    if (urls.length > 0) {
      setGallery((current) => [current, ...urls].filter(Boolean).join("\n"));
    }

    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={project.id} />
      <input
        type="hidden"
        name="locked_fields"
        value={(project.locked_fields ?? []).join(",")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="title">Título interno</Label>
          <input id="title" name="title" defaultValue={project.title ?? ""} className={field} />
        </div>

        <div>
          <Label htmlFor="project_name">Nombre del proyecto</Label>
          <input
            id="project_name"
            name="project_name"
            defaultValue={project.project_name ?? ""}
            className={field}
          />
        </div>

        <div>
          <Label htmlFor="client_name">Cliente</Label>
          <input
            id="client_name"
            name="client_name"
            defaultValue={project.client_name ?? ""}
            className={field}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Año</Label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={project.year ?? ""}
              className={field}
            />
          </div>
          <div>
            <Label htmlFor="project_date">Fecha</Label>
            <input
              id="project_date"
              name="project_date"
              type="date"
              defaultValue={project.project_date ?? ""}
              className={field}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Categoría</Label>
          <input
            id="category"
            name="category"
            defaultValue={project.category ?? ""}
            className={field}
          />
        </div>

        <div>
          <Label htmlFor="location">Ubicación</Label>
          <input
            id="location"
            name="location"
            defaultValue={project.location ?? ""}
            className={field}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="cover_url" hint="Dejalo vacío para usar la miniatura de YouTube.">
            Imagen de portada
          </Label>
          <input
            id="cover_url"
            name="cover_url"
            defaultValue={project.cover_url ?? ""}
            className={field}
          />
        </div>

        <div>
          <Label htmlFor="services" hint="Uno por línea.">
            Servicios
          </Label>
          <textarea
            id="services"
            name="services"
            rows={5}
            defaultValue={(project.services ?? []).join("\n")}
            className={field}
          />
        </div>

        <div>
          <Label htmlFor="tags" hint="Uno por línea.">
            Tags
          </Label>
          <textarea
            id="tags"
            name="tags"
            rows={5}
            defaultValue={(project.tags ?? []).join("\n")}
            className={field}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="story">Historia del proyecto</Label>
          <textarea
            id="story"
            name="story"
            rows={8}
            defaultValue={project.story ?? ""}
            className={field}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="results">Resultado</Label>
          <textarea
            id="results"
            name="results"
            rows={4}
            defaultValue={project.results ?? ""}
            className={field}
          />
        </div>

        <div>
          <Label htmlFor="credits" hint="Un crédito por línea, con el formato Rol: Nombre.">
            Créditos
          </Label>
          <textarea
            id="credits"
            name="credits"
            rows={6}
            defaultValue={(project.credits ?? [])
              .map((c: any) => `${c.role}: ${c.name}`)
              .join("\n")}
            className={field}
          />
        </div>

        <div>
          <Label
            htmlFor="making_of"
            hint="Una línea por video, con el formato Etiqueta | enlace de YouTube."
          >
            Making of
          </Label>
          <textarea
            id="making_of"
            name="making_of"
            rows={6}
            defaultValue={(project.making_of ?? [])
              .map((v: any) =>
                `${v.label} | ${v.youtubeId ? `https://youtu.be/${v.youtubeId}` : (v.url ?? "")}`,
              )
              .join("\n")}
            className={field}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="gallery" hint="Una URL por línea. También podés subir archivos.">
            Galería
          </Label>
          <textarea
            id="gallery"
            name="gallery"
            rows={6}
            value={gallery}
            onChange={(e) => setGallery(e.target.value)}
            className={field}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              ref={fileInput}
              id="upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => void upload(e.target.files)}
              className="sr-only"
            />
            <label
              htmlFor="upload"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-flame-warm hover:text-flame-warm"
            >
              <UploadSimpleIcon size={14} weight="bold" />
              {uploading ? "Subiendo" : "Subir imágenes"}
            </label>
            {uploadError && <p className="text-xs text-flame-warm">{uploadError}</p>}
          </div>
        </div>

        <div className="md:col-span-2 border-t border-line pt-6">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
            Datos que generó la IA
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="seo_title" hint="Máximo 60 caracteres.">
                Título SEO
              </Label>
              <input
                id="seo_title"
                name="seo_title"
                defaultValue={project.seo_title ?? ""}
                maxLength={70}
                className={field}
              />
            </div>

            <div>
              <Label htmlFor="home_excerpt" hint="Bajada corta para la portada.">
                Extracto
              </Label>
              <input
                id="home_excerpt"
                name="home_excerpt"
                defaultValue={project.home_excerpt ?? ""}
                maxLength={140}
                className={field}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="seo_description" hint="Máximo 155 caracteres.">
                Meta descripción
              </Label>
              <textarea
                id="seo_description"
                name="seo_description"
                rows={2}
                maxLength={170}
                defaultValue={project.seo_description ?? ""}
                className={field}
              />
            </div>
          </div>

          {(project.social_linkedin || project.social_instagram || project.social_facebook) && (
            <div className="mt-6 space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                Textos para redes, listos para copiar
              </p>
              {[
                ["LinkedIn", project.social_linkedin],
                ["Instagram", project.social_instagram],
                ["Facebook", project.social_facebook],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label as string} className="border border-line p-4">
                    <p className="mb-2 text-xs font-semibold text-paper">{label}</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-paper-dim">
                      {value as string}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <SaveBar state={state} />
    </form>
  );
}
