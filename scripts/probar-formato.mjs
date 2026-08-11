/**
 * Pasa el ejemplo que muestra el panel por el parser real, para confirmar que
 * la plantilla que le damos al estudio efectivamente cae en los campos que
 * espera el sitio.
 *
 *   node --import ./scripts/alias-hook.mjs scripts/probar-formato.mjs
 */
import { parseDescription } from "@/lib/youtube/parser.ts";
import { EJEMPLO, PLANTILLA } from "@/lib/formato-youtube.ts";

const r = parseDescription(EJEMPLO);

const linea = (k, v) =>
  console.log(
    String(k).padEnd(14),
    Array.isArray(v) ? `[${v.length}] ${JSON.stringify(v).slice(0, 68)}` : JSON.stringify(v)?.slice(0, 78),
  );

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
console.log("descripcion  :", (r.story || "").slice(0, 84).replace(/\n/g, " "), "...");
console.log("resultados   :", (r.results || "").slice(0, 84).replace(/\n/g, " "), "...");

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

console.log(
  "\n" + (faltan.length ? "NO SE LEYERON: " + faltan.join(", ") : "Todos los campos se leyeron bien."),
);

// El machete del canal no puede filtrarse a ningun campo.
const sucio = [
  r.story,
  r.results,
  ...r.tags,
  ...r.services,
  ...r.credits.map((c) => `${c.role} ${c.name}`),
]
  .filter(Boolean)
  .filter((t) => /instagram|seguinos|suscrib/i.test(t));

console.log(
  sucio.length
    ? "OJO, se colo el machete del canal en: " + sucio.join(" | ")
    : "Ningun campo quedo contaminado con el pie del canal.",
);

// La plantilla vacia tiene que reconocerse como estructurada igual.
const vacia = parseDescription(PLANTILLA);
console.log(
  vacia.structured
    ? "La plantilla vacia se reconoce como estructurada."
    : "PROBLEMA: la plantilla vacia no se reconoce.",
);
