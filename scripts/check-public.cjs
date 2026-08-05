/**
 * Muestra que proyectos ve el publico, con la clave publicable y RLS activo.
 * Uso: node scripts/check-public.cjs
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

const anon = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

(async () => {
  const { data, error } = await anon
    .from("projects")
    .select("slug, title, status, hidden, featured, sort_order, published_at")
    .eq("status", "published")
    .eq("hidden", false)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (error) {
    console.log("ERROR:", error.message);
    process.exit(1);
  }

  console.log("visibles para el publico:", data.length);
  for (const p of data) {
    console.log(
      ` - ${p.slug.padEnd(24)} orden:${p.sort_order} destacado:${p.featured} ${p.published_at}`,
    );
  }
})();
