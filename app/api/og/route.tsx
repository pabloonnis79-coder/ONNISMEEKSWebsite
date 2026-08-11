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
 * Está pensada para el peor caso, que es WhatsApp: no muestra la imagen
 * apaisada, la recorta al cuadrado del centro y lo dibuja a unos 120 px de
 * lado. A ese tamaño no entra una composición con varios elementos: lo único
 * que se lee es el título, así que el título se lleva casi todo el espacio y
 * el resto es apenas un marco.
 */

/** Ancho util: es lo que sobrevive al recorte cuadrado de WhatsApp. */
const COLUMNA = 560;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get("title")?.slice(0, 90) ?? site.name;
  const kicker = params.get("kicker")?.slice(0, 60) ?? site.tagline;

  /**
   * En la portada el titulo ya es el nombre del estudio; repetirlo arriba solo
   * agrega ruido en una miniatura donde cada pixel cuenta.
   */
  const repiteMarca = title.trim().toUpperCase() === site.name.toUpperCase();

  // Cuerpo grande a proposito. Los titulos largos bajan para no desbordar.
  const cuerpo = title.length > 46 ? 60 : title.length > 26 ? 78 : 104;

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
          {!repiteMarca && (
            <span
              style={{
                marginBottom: 34,
                color: "#f4f3f0",
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              Onnis&amp;Meeks
            </span>
          )}

          <span
            style={{
              color: "#f4f3f0",
              fontSize: cuerpo,
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>

          <div
            style={{
              marginTop: 34,
              display: "flex",
              width: 132,
              height: 12,
              backgroundColor: "#f26a1b",
            }}
          />

          <span
            style={{
              marginTop: 30,
              color: "#f5a623",
              fontSize: 26,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
