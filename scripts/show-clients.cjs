/**
 * Lista los clientes y de que proyecto salio cada uno.
 * Uso: node scripts/show-clients.cjs
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
  const { data: clients, error } = await db
    .from("clients")
    .select("slug, name")
    .order("name");

  if (error) {
    console.log("ERROR:", error.message);
    process.exit(1);
  }

  const { data: projects } = await db
    .from("projects")
    .select("slug, client_name, client_slug, youtube_id");

  console.log("clientes:", clients.length);
  for (const c of clients) {
    const usados = (projects ?? []).filter((p) => p.client_slug === c.slug);
    console.log(
      ` - ${String(c.name).padEnd(24)} proyectos: ${
        usados.map((p) => p.slug).join(", ") || "(ninguno)"
      }`,
    );
  }
})();
