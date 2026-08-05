import Groq from "groq-sdk";
import type { ParsedDescription } from "@/lib/youtube/parser";
import { truncate, uniq } from "@/lib/utils";

export type Enrichment = {
  aiSummary: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  homeExcerpt: string;
  socialLinkedin: string;
  socialInstagram: string;
  socialFacebook: string;
};

const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

/**
 * Em dashes are an instant "written by a machine" tell in Spanish marketing
 * copy, so they never reach the page regardless of what the model returns.
 */
function sanitize(text: string): string {
  return text
    .replace(/[——–]/g, "-")
    .replace(/\s+-\s+/g, ", ")
    .replace(/["""]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Une titular y cuerpo sin repetir. Si el video no trae descripcion, el cuerpo
 * termina siendo el mismo titular y quedaria "01 rell. 01 rell".
 */
function compose(headline: string, body: string | null, max: number): string {
  const clean = body?.replace(/\s+/g, " ").trim();
  if (!clean || clean.toLowerCase() === headline.toLowerCase()) {
    return truncate(headline, max);
  }
  if (clean.toLowerCase().startsWith(headline.toLowerCase())) {
    return truncate(clean, max);
  }
  return truncate(`${headline}. ${clean}`, max);
}

function fallback(
  parsed: ParsedDescription,
  title: string,
  brand: string,
): Enrichment {
  const name = parsed.projectName ?? title;
  const client = parsed.clientName;
  const headline = client ? `${name} para ${client}` : name;
  const body = parsed.story ?? parsed.results ?? null;
  const services = parsed.services.slice(0, 3).join(", ");

  const seoDescription = services
    ? truncate(`${headline}. ${services}.`, 155)
    : compose(headline, body, 155);

  return {
    aiSummary: compose(headline, body, 280),
    seoTitle: truncate(`${headline} | ${brand}`, 60),
    seoDescription,
    keywords: uniq(
      [
        ...parsed.tags,
        ...parsed.services,
        parsed.category,
        parsed.clientName,
        "producción audiovisual",
      ].filter(Boolean) as string[],
    ).slice(0, 12),
    homeExcerpt: truncate(body ?? headline, 110),
    socialLinkedin: compose(headline, body, 600),
    socialInstagram: compose(headline, body, 280),
    socialFacebook: compose(headline, body, 400),
  };
}

const SYSTEM = `Sos el editor de contenidos de una productora audiovisual argentina.
Escribís en español rioplatense, con acentuación correcta, en tono profesional, concreto y sobrio.
Reglas duras:
- Prohibido usar rayas largas. Nunca escribas los caracteres de raya larga ni de raya media.
- Prohibidas las palabras vacías y los adjetivos de relleno: elevar, potenciar, revolucionar,
  sinergia, next-gen, único, disruptivo, auténtico, cálido, mágico, inolvidable, especial,
  natural, atractivo, cautivante, envolvente, impactante.
- Prohibido cerrar una frase con un adjetivo decorativo que no esté en la historia.
  "Filmamos el plato en el salón" es correcto. "en un ambiente natural y atractivo" no.
- No inventes nada. Ni datos, ni clientes, ni premios, ni métricas, ni ambientes, ni sensaciones.
  Si la historia dice "salón", no deduzcas si es una casa, un restaurante o un estudio.
- Usá el nombre del proyecto y el del cliente tal como vienen en los campos "proyecto" y
  "cliente". El campo "titulo_video" es solo el nombre del archivo en YouTube: ignoralo si
  hay un "proyecto" cargado.
- Si falta información, escribí menos, no rellenes.
Respondés exclusivamente con un objeto JSON válido.`;

export function isAiConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

/**
 * Sin historia, cliente ni servicios no hay nada que redactar. Si igual se le
 * pide texto, el modelo escribe "sin informacion disponible" y esa frase
 * termina publicada como meta description. Mejor el respaldo, que solo repite
 * el titulo, y de paso no se gasta cuota.
 */
function hasEnoughContext(parsed: ParsedDescription): boolean {
  const story = (parsed.story ?? "").trim();
  const results = (parsed.results ?? "").trim();

  return (
    story.length >= 40 ||
    results.length >= 40 ||
    (Boolean(parsed.clientName) && parsed.services.length > 0)
  );
}

export async function enrichProject(
  parsed: ParsedDescription,
  title: string,
  brand = "ONNIS & MEEKS",
): Promise<Enrichment> {
  if (!process.env.GROQ_API_KEY) return fallback(parsed, title, brand);
  if (!hasEnoughContext(parsed)) return fallback(parsed, title, brand);

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const nombre = parsed.projectName ?? title;
  const titular = parsed.clientName ? `${nombre} para ${parsed.clientName}` : nombre;

  const input = {
    proyecto: parsed.projectName,
    cliente: parsed.clientName,
    anio: parsed.year,
    servicios: parsed.services,
    categoria: parsed.category,
    ubicacion: parsed.location,
    historia: parsed.story,
    resultados: parsed.results,
    tags: parsed.tags,
    titulo_video: title,
  };

  const userPrompt = `Información del proyecto (JSON):
${JSON.stringify(input, null, 2)}

El titular del proyecto es exactamente: "${titular}"

Devolvé un JSON con exactamente estas claves:
{
  "aiSummary": "resumen del proyecto en 2 o 3 oraciones, máximo 300 caracteres. Solo lo que dice la historia",
  "seoTitle": "empieza con '${titular}' y termina en ' | ${brand}'. Si no entra en 60 caracteres, recortá el titular, nunca la marca",
  "seoDescription": "meta description de máximo 155 caracteres. Tiene que nombrar el proyecto y el cliente, y decir qué se hizo",
  "keywords": ["8 a 12 palabras clave en minúsculas, sin repetir la misma palabra en singular y plural"],
  "homeExcerpt": "una frase de la historia que funcione como bajada, máximo 110 caracteres, sin punto final. No pegues nombres sueltos",
  "socialLinkedin": "post para LinkedIn, tono profesional, máximo 600 caracteres, sin hashtags genéricos",
  "socialInstagram": "caption para Instagram, máximo 280 caracteres, hasta 4 hashtags al final",
  "socialFacebook": "post para Facebook, máximo 400 caracteres"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      // Bajo a proposito: se busca que reformule lo que hay, no que invente.
      temperature: 0.25,
      max_tokens: 1400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return fallback(parsed, title, brand);

    const parsedJson = JSON.parse(content) as Partial<Enrichment>;
    const base = fallback(parsed, title, brand);

    return {
      aiSummary: sanitize(parsedJson.aiSummary || base.aiSummary),
      seoTitle: truncate(sanitize(parsedJson.seoTitle || base.seoTitle), 60),
      seoDescription: truncate(
        sanitize(parsedJson.seoDescription || base.seoDescription),
        155,
      ),
      keywords: Array.isArray(parsedJson.keywords)
        ? uniq(parsedJson.keywords.map((k) => String(k).toLowerCase().trim())).slice(0, 12)
        : base.keywords,
      homeExcerpt: truncate(sanitize(parsedJson.homeExcerpt || base.homeExcerpt), 110),
      socialLinkedin: sanitize(parsedJson.socialLinkedin || base.socialLinkedin),
      socialInstagram: sanitize(parsedJson.socialInstagram || base.socialInstagram),
      socialFacebook: sanitize(parsedJson.socialFacebook || base.socialFacebook),
    };
  } catch (error) {
    console.error("[ai] enrichProject fallo, uso fallback deterministico:", error);
    return fallback(parsed, title, brand);
  }
}
