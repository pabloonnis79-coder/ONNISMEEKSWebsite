import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { runSync } from "@/lib/youtube/sync";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Autoriza al cron de Vercel por secreto, o a un admin logueado. */
async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization");
    if (header === `Bearer ${secret}`) return true;
    if (request.nextUrl.searchParams.get("secret") === secret) return true;
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return Boolean(data.user);
  } catch {
    return false;
  }
}

function refreshCaches() {
  revalidatePath("/");
  revalidatePath("/proyectos");
  revalidatePath("/clientes");
  revalidatePath("/detras-de-camara");
  revalidatePath("/sitemap.xml");
}

async function handle(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const force = params.get("force") === "1";
  const videoIds = params.get("video")?.split(",").filter(Boolean);

  try {
    const summary = await runSync({
      force,
      videoIds,
      trigger: params.get("secret") || request.headers.get("authorization") ? "cron" : "manual",
    });

    refreshCaches();
    return NextResponse.json({ ok: summary.errors.length === 0, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[sync]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
