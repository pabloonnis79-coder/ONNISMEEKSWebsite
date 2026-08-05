import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { site } from "@/lib/site";

export const runtime = "edge";

/**
 * Tarjeta para compartir en redes. Se genera en el momento, así cada proyecto
 * tiene su propia imagen sin que nadie tenga que exportarla a mano.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get("title")?.slice(0, 90) ?? site.name;
  const kicker = params.get("kicker")?.slice(0, 60) ?? site.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0e0e0d",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span
            style={{
              color: "#f4f3f0",
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            Onnis&amp;Meeks
          </span>
          <div
            style={{
              width: 34,
              height: 34,
              border: "6px solid #f26a1b",
              display: "flex",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#f5a623",
              fontSize: 24,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </span>
          <span
            style={{
              marginTop: 22,
              color: "#f4f3f0",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
        </div>

        <div style={{ display: "flex", height: 10, width: "100%", backgroundColor: "#f26a1b" }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
