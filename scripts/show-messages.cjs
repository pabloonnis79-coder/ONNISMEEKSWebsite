/**
 * Ultimos mensajes del formulario de contacto.
 * Uso: node scripts/show-messages.cjs
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
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return console.error("ERROR:", error.code, error.message);
  console.log("mensajes:", data.length);
  for (const m of data) {
    console.log("-", m.created_at, "|", m.name, "<" + m.email + ">", "|", String(m.message || "").slice(0, 60));
  }
})();
