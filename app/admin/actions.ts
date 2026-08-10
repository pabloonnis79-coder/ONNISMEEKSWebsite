"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CLAVE_AUTORIDADES,
  CLAVE_FOTOGRAFIA,
  CLAVE_MARCAS,
  CLAVE_REELS,
  CLAVE_VIDEOS_SECCION,
  normalizarImagen,
} from "@/lib/db/settings";
import { extraerYoutubeId, slugify, uniq } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Todas las escrituras pasan por la sesión del panel, nunca por service role. */
async function client() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sesión vencida");
  return supabase;
}

function refresh(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/proyectos");
  revalidatePath("/clientes");
  revalidatePath("/detras-de-camara");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/proyectos/${slug}`);
}

/* --------------------------------------------------------------- toggles -- */

export async function toggleField(
  id: string,
  field: "featured" | "hidden",
  value: boolean,
) {
  const supabase = await client();
  const { data } = await supabase
    .from("projects")
    .update({ [field]: value })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  refresh(data?.slug);
}

export async function setStatus(id: string, status: "draft" | "published") {
  const supabase = await client();
  const { data } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  refresh(data?.slug);
}

export async function setSortOrder(id: string, sortOrder: number) {
  const supabase = await client();
  await supabase.from("projects").update({ sort_order: sortOrder }).eq("id", id);
  refresh();
}

/** Mueve el proyecto una posición arriba o abajo intercambiando el orden. */
export async function moveProject(id: string, direction: "up" | "down") {
  const supabase = await client();

  const { data: rows } = await supabase
    .from("projects")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  const list = (rows ?? []) as Array<{ id: string; sort_order: number }>;
  const index = list.findIndex((r) => r.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= list.length) return;

  // Se reescribe todo el orden para evitar empates heredados de la sync.
  const reordered = [...list];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];

  await Promise.all(
    reordered.map((row, i) =>
      supabase.from("projects").update({ sort_order: i + 1 }).eq("id", row.id),
    ),
  );

  refresh();
}

export async function deleteProject(id: string) {
  const supabase = await client();
  const { data } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  refresh(data?.slug);
}

/* ------------------------------------------------------------------ edit -- */

function parseLines(value: FormDataEntryValue | null): string[] {
  return uniq(
    String(value ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function parseCredits(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [role, ...rest] = line.split(":");
      return { role: role.trim(), name: rest.join(":").trim() };
    })
    .filter((c) => c.role && c.name);
}

function parseGallery(value: FormDataEntryValue | null) {
  return parseLines(value)
    .filter((url) => /^https?:\/\//.test(url))
    .map((url) => ({ url, alt: "" }));
}

function parseVideos(value: FormDataEntryValue | null) {
  return parseLines(value).map((line) => {
    const [label, ref] = line.includes("|") ? line.split("|") : ["Making of", line];
    const match = /(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/.exec(ref ?? "");
    return match
      ? { label: label.trim(), youtubeId: match[1] }
      : { label: label.trim(), url: (ref ?? "").trim() };
  });
}

export type SaveState = { status: "idle" | "ok" | "error"; message?: string };

export async function saveProject(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Falta el identificador" };

  const clientName = String(formData.get("client_name") ?? "").trim();

  const patch: Record<string, any> = {
    title: String(formData.get("title") ?? "").trim(),
    project_name: String(formData.get("project_name") ?? "").trim() || null,
    client_name: clientName || null,
    client_slug: clientName ? slugify(clientName) : null,
    year: Number(formData.get("year")) || null,
    project_date: String(formData.get("project_date") ?? "") || null,
    category: String(formData.get("category") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    story: String(formData.get("story") ?? "").trim() || null,
    results: String(formData.get("results") ?? "").trim() || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    services: parseLines(formData.get("services")),
    tags: parseLines(formData.get("tags")),
    credits: parseCredits(formData.get("credits")),
    gallery: parseGallery(formData.get("gallery")),
    making_of: parseVideos(formData.get("making_of")),
    seo_title: String(formData.get("seo_title") ?? "").trim() || null,
    seo_description: String(formData.get("seo_description") ?? "").trim() || null,
    home_excerpt: String(formData.get("home_excerpt") ?? "").trim() || null,
  };

  if (!patch.title) return { status: "error", message: "El título no puede quedar vacío" };

  // Lo editado a mano queda protegido: la próxima sincronización no lo pisa.
  const locked = uniq([
    ...String(formData.get("locked_fields") ?? "").split(",").filter(Boolean),
    ...Object.keys(patch),
  ]);
  patch.locked_fields = locked;

  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("projects")
      .update(patch)
      .eq("id", id)
      .select("slug")
      .maybeSingle();

    if (error) throw new Error(error.message);

    refresh(data?.slug);
    return { status: "ok", message: "Cambios guardados" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar",
    };
  }
}

/* --------------------------------------------------- proyecto manual ------ */

export async function createManualProject(formData: FormData) {
  const supabase = await client();

  const title = String(formData.get("title") ?? "").trim() || "Proyecto sin título";
  const clientName = String(formData.get("client_name") ?? "").trim();
  const base = slugify([clientName, title].filter(Boolean).join(" ")) || "proyecto";

  const { data: existing } = await supabase
    .from("projects")
    .select("slug")
    .like("slug", `${base}%`);

  const slug =
    (existing ?? []).length > 0 ? `${base}-${(existing ?? []).length + 1}` : base;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title,
      project_name: title,
      client_name: clientName || null,
      client_slug: clientName ? slugify(clientName) : null,
      slug,
      source: "manual",
      status: "draft",
      year: new Date().getFullYear(),
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  refresh();
  redirect(`/admin/proyectos/${data.id}`);
}

/* ------------------------------------------- videos de fondo por seccion -- */

export async function saveSectionVideos(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const value: Record<string, string> = {};
  const invalidas: string[] = [];

  for (const [campo, bruto] of formData.entries()) {
    if (!campo.startsWith("seccion_")) continue;

    const slug = campo.slice("seccion_".length);
    const texto = String(bruto).trim();
    if (!texto) continue;

    const id = extraerYoutubeId(texto);
    if (!id) {
      invalidas.push(slug);
      continue;
    }
    value[slug] = id;
  }

  if (invalidas.length > 0) {
    return {
      status: "error",
      message: `No pude leer el id de YouTube en: ${invalidas.join(", ")}. Pegá el enlace completo del video.`,
    };
  }

  try {
    const supabase = await client();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: CLAVE_VIDEOS_SECCION, value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/servicios");
    revalidatePath("/admin/secciones");

    return { status: "ok", message: "Videos actualizados." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar",
    };
  }
}

/* ---------------------------------------------------- autoridades --------- */

export async function saveAuthorities(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const value: Array<Record<string, string>> = [];

  for (let i = 0; i < 3; i++) {
    const nombre = String(formData.get(`nombre_${i}`) ?? "").trim();
    const apellido = String(formData.get(`apellido_${i}`) ?? "").trim();
    const cargo = String(formData.get(`cargo_${i}`) ?? "").trim();
    const foto = String(formData.get(`foto_${i}`) ?? "").trim();

    // Una ficha sin nombre no dice nada: se descarta en silencio.
    if (!nombre && !apellido) continue;

    if (foto && !/^https?:\/\//.test(foto)) {
      return {
        status: "error",
        message: `La foto de ${nombre || apellido} tiene que ser un enlace que empiece con http. Subila y pegá la dirección.`,
      };
    }

    value.push({ nombre, apellido, cargo, foto });
  }

  try {
    const supabase = await client();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: CLAVE_AUTORIDADES, value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/estudio");
    revalidatePath("/admin/autoridades");

    return {
      status: "ok",
      message: value.length === 0 ? "Sección vacía, no se muestra." : "Autoridades actualizadas.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar",
    };
  }
}

/* ------------------------------------------------- galerías de fotografía -- */

// Los topes viven en lib/db/settings: un archivo "use server" solo puede
// exportar funciones asíncronas, así que acá no pueden ser públicos.

export async function savePhotoGalleries(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const value: Array<{ titulo: string; fotos: string[] }> = [];

  for (let i = 0; i < 4; i++) {
    const titulo = String(formData.get(`titulo_${i}`) ?? "").trim();
    const fotos = parseLines(formData.get(`fotos_${i}`))
      .map((f) => normalizarImagen(f))
      .filter((f) => /^https?:\/\//.test(f));

    if (!titulo || fotos.length === 0) continue;
    value.push({ titulo, fotos });
  }

  try {
    const supabase = await client();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: CLAVE_FOTOGRAFIA, value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/servicios/produccion-fotografica");
    revalidatePath("/admin/fotografia");

    const total = value.reduce((n, g) => n + g.fotos.length, 0);
    return {
      status: "ok",
      message:
        value.length === 0
          ? "Sin galerías cargadas."
          : `${value.length} categorías, ${total} fotos.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar",
    };
  }
}

/* ------------------------------------------------------ marcas y logos ----- */

export async function saveBrandLogos(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const value: Array<{ nombre: string; logo: string; sitio: string }> = [];

  for (let i = 0; i < 12; i++) {
    const nombre = String(formData.get(`marca_nombre_${i}`) ?? "").trim();
    const logo = normalizarImagen(String(formData.get(`marca_logo_${i}`) ?? ""));
    const sitio = String(formData.get(`marca_sitio_${i}`) ?? "").trim();

    if (!nombre && !logo) continue;

    if (logo && !/^https?:\/\//.test(logo)) {
      return {
        status: "error",
        message: `El logo de ${nombre || `la marca ${i + 1}`} tiene que ser un enlace que empiece con http.`,
      };
    }

    value.push({ nombre, logo, sitio });
  }

  try {
    const supabase = await client();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: CLAVE_MARCAS, value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/clientes");
    revalidatePath("/admin/marcas");

    return {
      status: "ok",
      message: value.length === 0 ? "Sin marcas cargadas." : `${value.length} marcas guardadas.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar",
    };
  }
}

/* ------------------------------------------------------ reels verticales -- */

export async function saveReels(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const value: Array<{ youtubeId: string; titulo: string; cliente: string }> = [];
  const invalidos: number[] = [];

  for (let i = 0; i < 8; i++) {
    const bruto = String(formData.get(`reel_url_${i}`) ?? "").trim();
    const titulo = String(formData.get(`reel_titulo_${i}`) ?? "").trim();
    const cliente = String(formData.get(`reel_cliente_${i}`) ?? "").trim();

    if (!bruto) continue;

    const youtubeId = extraerYoutubeId(bruto);
    if (!youtubeId) {
      invalidos.push(i + 1);
      continue;
    }

    value.push({ youtubeId, titulo, cliente });
  }

  if (invalidos.length > 0) {
    return {
      status: "error",
      message: `No pude leer el enlace de YouTube en el reel ${invalidos.join(", ")}. Pegá la dirección completa del Short.`,
    };
  }

  try {
    const supabase = await client();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: CLAVE_REELS, value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/reels");

    return {
      status: "ok",
      message: value.length === 0 ? "Sin reels cargados." : `${value.length} reels publicados.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar",
    };
  }
}

/* ---------------------------------------------------------------- sesión -- */

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
