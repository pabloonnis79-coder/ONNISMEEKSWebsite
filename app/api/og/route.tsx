import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { site } from "@/lib/site";

// El runtime edge quedo deprecado en Next 16 y ademas desactiva la generacion
// estatica de la ruta.
export const runtime = "nodejs";

/**
 * Tarjeta para compartir en redes. Se genera en el momento, así cada proyecto
 * tiene su propia imagen sin que nadie tenga que exportarla a mano.
 *
 * La composición va centrada y dentro de una columna angosta, y no es una
 * decisión estética: WhatsApp no muestra la imagen apaisada, la recorta al
 * cuadrado del centro. Con el texto alineado a la izquierda, ese recorte se
 * comía el principio del título. Todo lo que importa entra en los 630 px
 * centrales, que es lo único que sobrevive al recorte.
 */

/** Ancho del cuadrado que conserva WhatsApp, menos un margen de respeto. */
const COLUMNA = 600;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get("title")?.slice(0, 90) ?? site.name;
  const kicker = params.get("kicker")?.slice(0, 60) ?? site.tagline;

  // Los títulos largos bajan de cuerpo para no desbordar la columna.
  const cuerpo = title.length > 44 ? 44 : title.length > 24 ? 56 : 70;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0e0e0d",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: COLUMNA,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                color: "#f4f3f0",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              Onnis&amp;Meeks
            </span>
            <div
              style={{
                width: 26,
                height: 26,
                border: "5px solid #f26a1b",
                display: "flex",
              }}
            />
          </div>

          <span
            style={{
              marginTop: 54,
              color: "#f5a623",
              fontSize: 21,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </span>

          <span
            style={{
              marginTop: 20,
              color: "#f4f3f0",
              fontSize: cuerpo,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>

          <div
            style={{
              marginTop: 46,
              display: "flex",
              width: 108,
              height: 8,
              backgroundColor: "#f26a1b",
            }}
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
