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

function fallback(
  parsed: ParsedDescription,
  title: string,
  brand: string,
): Enrichment {
  const name = parsed.projectName ?? title;
  const client = parsed.clientName;
  const headline = client ? `${name} para ${client}` : name;
  const body = parsed.story ?? parsed.results ?? headline;
  const services = parsed.services.slice(0, 3).join(", ");

  return {
    aiSummary: truncate(body, 280),
    seoTitle: truncate(`${headline} | ${brand}`, 60),
    seoDescription: truncate(
      services ? `${headline}. ${services}.` : `${headline}. ${body}`,
      155,
    ),
    keywords: uniq(
      [
        ...parsed.tags,
        ...parsed.services,
        parsed.category,
        parsed.clientName,
        "producción audiovisual",
      ].filter(Boolean) as string[],
    ).slice(0, 12),
    homeExcerpt: truncate(body, 110),
    socialLinkedin: `${headline}. ${truncate(body, 220)}`,
    socialInstagram: `${headline}. ${truncate(body, 140)}`,
    socialFacebook: `${headline}. ${truncate(body, 180)}`,
  };
}

const SYSTEM = `Sos el editor de contenidos de una productora audiovisual argentina.
Escribís en español rioplatense, con acentuación correcta, en tono profesional, concreto y sobrio.
Reglas duras:
- Prohibido usar rayas largas. Nunca escribas los caracteres de raya larga ni de raya media.
- Prohibidas las palabras vacías: elevar, potenciar, revolucionar, sinergia, next-gen, único, disruptivo.
- No inventes datos, clientes, premios ni métricas que no estén en la información recibida.
- Si falta información, escribí menos, no rellenes.
Respondés exclusivamente con un objeto JSON válido.`;

export function isAiConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export async function enrichProject(
  parsed: ParsedDescription,
  title: string,
  brand = "ONNIS & MEEKS",
): Promise<Enrichment> {
  if (!process.env.GROQ_API_KEY) return fallback(parsed, title, brand);

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const input = {
    titulo_video: title,
    cliente: parsed.clientName,
    proyecto: parsed.projectName,
    anio: parsed.year,
    servicios: parsed.services,
    categoria: parsed.category,
    ubicacion: parsed.location,
    historia: parsed.story,
    resultados: parsed.results,
    tags: parsed.tags,
  };

  const userPrompt = `Información del proyecto (JSON):
${JSON.stringify(input, null, 2)}

Devolvé un JSON con exactamente estas claves:
{
  "aiSummary": "resumen profesional del proyecto, 2 o 3 oraciones, máximo 300 caracteres",
  "seoTitle": "título SEO, máximo 60 caracteres, terminado en ' | ${brand}'",
  "seoDescription": "meta description, máximo 155 caracteres",
  "keywords": ["8 a 12 palabras clave en minúsculas"],
  "homeExcerpt": "bajada corta para la portada, máximo 110 caracteres, sin punto final",
  "socialLinkedin": "post para LinkedIn, tono profesional, máximo 600 caracteres, sin hashtags genéricos",
  "socialInstagram": "caption para Instagram, máximo 280 caracteres, hasta 4 hashtags al final",
  "socialFacebook": "post para Facebook, máximo 400 caracteres"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
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
