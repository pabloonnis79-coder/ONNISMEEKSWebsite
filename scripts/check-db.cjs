/**
 * Chequeo rapido contra Supabase con la clave de servicio.
 * Uso: node scripts/check-db.cjs
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

const TABLAS = ["projects", "clients", "sync_runs", "contact_messages"];

(async () => {
  for (const tabla of TABLAS) {
    const { count, error } = await db
      .from(tabla)
      .select("*", { count: "exact", head: false })
      .limit(1);

    console.log(
      `${tabla.padEnd(18)} ${error ? `ERROR: ${error.message}` : `ok, ${count ?? 0} filas`}`,
    );
  }

  const { data } = await db
    .from("contact_messages")
    .select("name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  if (data?.length) {
    console.log("\nUltimos mensajes:");
    for (const r of data) console.log(` - ${r.created_at} | ${r.name} | ${r.email}`);
  }
})();
