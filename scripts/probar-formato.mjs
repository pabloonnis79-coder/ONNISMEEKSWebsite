/**
 * Pasa el ejemplo de docs/formato-descripcion-youtube.md por el parser real,
 * para confirmar que la plantilla que le damos al estudio efectivamente cae en
 * los campos que espera el sitio.
 */
import { readFileSync } from "node:fs";
import { parseDescription } from "@/lib/youtube/parser.ts";

const doc = readFileSync("docs/formato-descripcion-youtube.md", "utf8");
// El segundo bloque de codigo del documento es el ejemplo completo.
const bloques = [...doc.matchAll(/```\n([\s\S]*?)```/g)].map((m) => m[1]);
const ejemplo = bloques[1];

const r = parseDescription(ejemplo);

const linea = (k, v) => console.log(String(k).padEnd(14), Array.isArray(v) ? `[${v.length}] ${JSON.stringify(v).slice(0, 70)}` : JSON.stringify(v)?.slice(0, 80));

console.log("estructurado :", r.structured, "\n");
linea("cliente", r.clientName);
linea("proyecto", r.projectName);
linea("anio", r.year);
linea("fecha", r.projectDate);
linea("categoria", r.category);
linea("ubicacion", r.location);
linea("servicios", r.services);
linea("tags", r.tags);
linea("creditos", r.credits);
console.log("descripcion  :", (r.story || "").slice(0, 90).replace(/\n/g, " "), "...");
console.log("resultados   :", (r.results || "").slice(0, 90).replace(/\n/g, " "), "...");

const faltan = [];
if (!r.clientName) faltan.push("cliente");
if (!r.projectName) faltan.push("proyecto");
if (!r.year) faltan.push("anio");
if (!r.projectDate) faltan.push("fecha");
if (!r.category) faltan.push("categoria");
if (!r.location) faltan.push("ubicacion");
if (!r.services.length) faltan.push("servicios");
if (!r.credits.length) faltan.push("creditos");
if (!r.tags.length) faltan.push("tags");
if (!r.story) faltan.push("descripcion");
if (!r.results) faltan.push("resultados");

console.log("\n" + (faltan.length ? "NO SE LEYERON: " + faltan.join(", ") : "Todos los campos se leyeron bien."));
if ((r.story || "").includes("Instagram")) console.log("OJO: el machete del canal se coló en la descripcion.");
