/**
 * Genera las firmas de las tres personas con el codigo real y las escribe en
 * un HTML para mirarlas. Sirve para revisar el resultado sin entrar al panel.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { construirFirma } from "../lib/firma.ts";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data } = await db.from("site_settings").select("value").eq("key", "authorities").single();

const bloques = data.value.map((p) => {
  const datos = { ...p, email: p.email || "" };
  return `<h3>${p.nombre} ${p.apellido}</h3>
<div class="caja">${construirFirma(datos, true)}</div>
<div class="caja">${construirFirma(datos, false)}</div>`;
}).join("\n");

writeFileSync(
  "docs/firmas-equipo.html",
  `<!doctype html><meta charset="utf-8"><title>Firmas del equipo</title>
<style>body{font:15px/1.6 system-ui;background:#f4f3f0;padding:40px;max-width:800px;margin:0 auto}
h3{margin:36px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:.12em;color:#f26a1b}
.caja{background:#fff;border:1px solid #e5e3df;border-radius:8px;padding:24px;margin-bottom:10px}</style>
<h1>Firmas del equipo</h1>
<p>Generadas con el mismo codigo que usa el panel.</p>
${bloques}`,
);

console.log("escrito docs/firmas-equipo.html");
for (const p of data.value) {
  console.log(`- ${p.nombre} ${p.apellido} | ${p.cargo} | correo: ${p.email || "FALTA"}`);
}
