/**
 * Muestra como quedaron los proyectos despues de sincronizar.
 * Uso: node scripts/show-projects.cjs
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

(async () => {
  const { data, error } = await db
    .from("projects")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.log("ERROR:", error.message);
    process.exit(1);
  }

  for (const p of data) {
    console.log("=".repeat(64));
    console.log("slug        :", p.slug);
    console.log("youtube     :", p.youtube_id);
    console.log("titulo      :", p.title);
    console.log("cliente     :", p.client_name ?? "(vacio)");
    console.log("anio        :", p.year, " fecha:", p.project_date);
    console.log("categoria   :", p.category ?? "(vacio)");
    console.log("servicios   :", (p.services ?? []).join(", ") || "(vacio)");
    console.log("tags        :", (p.tags ?? []).join(", ") || "(vacio)");
    console.log("duracion    :", p.duration_seconds, "s");
    console.log("destacado   :", p.featured, " oculto:", p.hidden, " estado:", p.status);
    console.log("portada     :", p.cover_url);
    console.log("historia    :", (p.story ?? "(vacio)").slice(0, 160));
    console.log("--- IA ---");
    console.log("resumen     :", p.ai_summary);
    console.log("seo title   :", p.seo_title);
    console.log("seo desc    :", p.seo_description);
    console.log("extracto    :", p.home_excerpt);
    console.log("keywords    :", (p.keywords ?? []).join(", "));
    console.log("linkedin    :", (p.social_linkedin ?? "").slice(0, 140));
  }

  const { data: clients } = await db.from("clients").select("slug, name");
  console.log("=".repeat(64));
  console.log("clientes creados:", clients?.map((c) => c.name).join(", ") || "(ninguno)");
})();
