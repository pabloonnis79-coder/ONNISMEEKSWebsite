import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { runSync } from "@/lib/youtube/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook PubSubHubbub de YouTube. Avisa en el momento en que se publica o se
 * edita un video del canal, asi el sitio no depende solo del cron.
 *
 * Suscripcion (una vez, y se renueva cada 5 dias con el cron):
 *   hub.mode=subscribe
 *   hub.topic=https://www.youtube.com/xml/feeds/videos.xml?channel_id=UCxxxx
 *   hub.callback=https://onnismeeks.com/api/youtube/webhook
 */

/** Handshake de verificacion: hay que devolver el challenge en texto plano. */
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (!challenge) return NextResponse.json({ ok: true });

  return new NextResponse(challenge, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}

function signatureIsValid(body: string, header: string | null): boolean {
  const secret = process.env.PUBSUB_SECRET;
  if (!secret) return true; // sin secreto configurado no se valida
  if (!header) return false;

  const [algo, sent] = header.split("=");
  if (!algo || !sent) return false;

  const expected = crypto.createHmac(algo, secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sent);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  if (!signatureIsValid(body, request.headers.get("x-hub-signature"))) {
    return NextResponse.json({ error: "Firma invalida" }, { status: 401 });
  }

  const ids = [...body.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)].map((m) => m[1]);
  if (ids.length === 0) return NextResponse.json({ ok: true, ignored: true });

  try {
    const summary = await runSync({ videoIds: ids, trigger: "webhook" });

    revalidatePath("/");
    revalidatePath("/proyectos");
    revalidatePath("/clientes");

    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("[webhook]", error);
    // 200 a proposito: si devolvemos error, YouTube reintenta en loop.
    return NextResponse.json({ ok: false });
  }
}
