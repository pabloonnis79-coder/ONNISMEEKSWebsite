/**
 * Aplica el filtro de spam a los mensajes que ya estaban guardados.
 *
 *   node scripts/clasificar-spam.cjs           -> solo muestra que haria
 *   node scripts/clasificar-spam.cjs --aplicar -> escribe el cambio
 *
 * Marcar no borra nada: desde /admin/mensajes se revierte con "No es spam".
 */
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

const FRASES = ["dear sir", "dear madam", "dear owner", "best regards", "kindly",
  "seo", "search engine", "domain name", "trademark", "web development"];

function evaluar(m) {
  const motivos = [];
  let p = 0;
  const texto = `${m.name} ${m.company || ""} ${m.message}`.toLowerCase();
  const [local, dominio] = String(m.email).toLowerCase().split("@");

  const enlaces = (m.message.match(/https?:\/\/|www\./gi) || []).length;
  if (enlaces >= 3) { p += 3; motivos.push(`${enlaces} enlaces`); }
  else if (enlaces >= 1) { p += 2; motivos.push("tiene enlaces"); }

  const frases = FRASES.filter((f) => texto.includes(f));
  if (frases.length) { p += frases.length >= 2 ? 3 : 2; motivos.push(`frases: ${frases.slice(0,3).join(", ")}`); }

  if (dominio && dominio.startsWith("gmail.") && (local.match(/\./g) || []).length >= 3) {
    p += 3; motivos.push("gmail con puntos de relleno");
  }

  if (dominio && dominio.includes("onnismeeks") && dominio !== "onnismeeks.com") {
    p += 4; motivos.push("dominio que imita al nuestro");
  }

  return { esSpam: p >= 4, puntaje: p, motivos };
}

(async () => {
  const { data, error } = await db
    .from("contact_messages")
    .select("id,name,email,company,message,source,created_at")
    .order("created_at", { ascending: false });

  if (error) return console.error("ERROR:", error.message);

  const aplicar = process.argv.includes("--aplicar");
  const marcar = [];

  for (const m of data) {
    const v = evaluar(m);
    const ya = m.source === "spam";
    const etiqueta = v.esSpam ? "SPAM " : "ok   ";
    console.log(`${etiqueta} ${String(m.name).slice(0, 22).padEnd(22)} ${String(m.email).padEnd(38)} ${v.motivos.join(" | ")}`);
    if (v.esSpam && !ya) marcar.push(m.id);
  }

  console.log(`\n${marcar.length} mensajes para mover a spam.`);

  if (!aplicar) return console.log("(Nada escrito. Agregar --aplicar para confirmar.)");
  if (!marcar.length) return;

  const { error: e2 } = await db.from("contact_messages").update({ source: "spam" }).in("id", marcar);
  console.log(e2 ? `ERROR: ${e2.message}` : "Listo, movidos a spam.");
})();
