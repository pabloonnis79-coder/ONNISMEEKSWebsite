/** Verifica que site_settings exista y muestra que claves tiene. */
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
(async () => {
  const { data, error } = await db.from("site_settings").select("key,value");
  if (error) return console.log("FALTA LA TABLA ->", error.code, error.message);
  console.log("site_settings OK, claves guardadas:", data.length);
  for (const r of data) console.log(" -", r.key, "=>", JSON.stringify(r.value).slice(0, 90));
})();
