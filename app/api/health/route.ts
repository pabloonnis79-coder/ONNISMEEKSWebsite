import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getUploadsPlaylistId, isYouTubeConfigured } from "@/lib/youtube/api";
import { isAiConfigured } from "@/lib/ai/enrich";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnóstico de puesta en marcha. Dice qué servicio falta conectar y si el
 * que ya está conectado responde de verdad. No devuelve ninguna credencial.
 */

type Check = {
  nombre: string;
  configurado: boolean;
  ok: boolean;
  detalle: string;
};

const TABLAS = ["projects", "clients", "sync_runs", "contact_messages"] as const;

async function checkSupabase(): Promise<Check[]> {
  if (!isSupabaseConfigured()) {
    const faltan = [
      !process.env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ].filter(Boolean);

    return [
      {
        nombre: "supabase",
        configurado: false,
        ok: false,
        detalle: `Falta ${faltan.join(" y ")}`,
      },
    ];
  }

  const supabase = await createClient();
  const checks: Check[] = [];

  for (const tabla of TABLAS) {
    const { error } = await supabase.from(tabla).select("*", { count: "exact", head: true });
    checks.push({
      nombre: `tabla ${tabla}`,
      configurado: true,
      ok: !error,
      detalle: error ? error.message : "responde",
    });
  }

  checks.push({
    nombre: "service role",
    configurado: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    detalle: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "cargada"
      : "Falta SUPABASE_SERVICE_ROLE_KEY, sin esto no corre la sincronización ni el formulario",
  });

  return checks;
}

async function checkYouTube(): Promise<Check> {
  if (!isYouTubeConfigured()) {
    return {
      nombre: "youtube",
      configurado: false,
      ok: false,
      detalle: "Falta YOUTUBE_API_KEY y el canal (YOUTUBE_CHANNEL_ID o YOUTUBE_CHANNEL_HANDLE)",
    };
  }

  try {
    const playlist = await getUploadsPlaylistId();
    return {
      nombre: "youtube",
      configurado: true,
      ok: true,
      detalle: `canal resuelto, playlist de subidas ${playlist}`,
    };
  } catch (error) {
    return {
      nombre: "youtube",
      configurado: true,
      ok: false,
      detalle: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  const [supabase, youtube] = await Promise.all([checkSupabase(), checkYouTube()]);

  const checks: Check[] = [
    ...supabase,
    youtube,
    {
      nombre: "groq",
      configurado: isAiConfigured(),
      ok: true,
      detalle: isAiConfigured()
        ? "conectado"
        : "sin GROQ_API_KEY los textos SEO se arman con la lógica de respaldo",
    },
    {
      nombre: "cron",
      configurado: Boolean(process.env.CRON_SECRET),
      ok: true,
      detalle: process.env.CRON_SECRET
        ? "protegido"
        : "sin CRON_SECRET, /api/sync solo acepta admin logueado",
    },
    {
      nombre: "showreel",
      configurado: Boolean(process.env.NEXT_PUBLIC_SHOWREEL_YOUTUBE_ID),
      ok: true,
      detalle: process.env.NEXT_PUBLIC_SHOWREEL_YOUTUBE_ID
        ? "cargado"
        : "sin showreel el hero usa la portada del proyecto destacado",
    },
  ];

  const bloqueantes = checks.filter((c) => !c.ok);

  return NextResponse.json(
    {
      listo: bloqueantes.length === 0,
      pendientes: bloqueantes.map((c) => c.nombre),
      checks,
    },
    { status: bloqueantes.length === 0 ? 200 : 503 },
  );
}
