/**
 * Arma el favicon chico a partir del logo grande.
 *
 * El logo completo no se lee a 16 px, que es el tamano real de la pestana.
 * Asi que para los tamanos chicos usamos solo el ampersand con su corchete
 * naranja, que ya son parte de la marca. La letra no se redibuja ni se busca
 * una tipografia parecida: se recorta del propio logo, asi que es exactamente
 * la misma forma.
 *
 *   node scripts/generar-iconos.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const ORIGEN = "public/web-app-manifest-512x512.png";

/** Recuadro del ampersand dentro del logo, medido sobre los pixeles. */
const AMP = { left: 385, top: 192, width: 61, height: 62 };

const TINTA = "#0e0e0d";
const LIENZO = 192;

/**
 * Convierte el recorte en una silueta blanca con transparencia. El recorte
 * viene con el fondo del logo pegado; si lo pegaramos tal cual quedaria un
 * parche cuadrado de otro gris sobre el fondo nuevo.
 */
async function siluetaAmpersand() {
  const { data, info } = await sharp(ORIGEN)
    .extract(AMP)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const salida = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const luz = 0.299 * r + 0.587 * g + 0.114 * b;

    // Rampa entre el gris del fondo y el blanco de la letra: conserva el
    // antialiasing del original en vez de dejar los bordes dentados.
    const alfa = Math.max(0, Math.min(255, Math.round(((luz - 70) / 150) * 255)));

    salida[i * 4] = 255;
    salida[i * 4 + 1] = 255;
    salida[i * 4 + 2] = 255;
    salida[i * 4 + 3] = alfa;
  }

  return sharp(salida, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

/** Fondo con el corchete naranja, en vectores: sin depender de ninguna fuente. */
function fondo() {
  const m = Math.round(LIENZO * 0.18); // margen del corchete
  const grosor = Math.round(LIENZO * 0.066);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${LIENZO}" height="${LIENZO}">
  <defs>
    <linearGradient id="llama" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d1490b"/>
      <stop offset="0.45" stop-color="#f26a1b"/>
      <stop offset="1" stop-color="#f5a623"/>
    </linearGradient>
  </defs>
  <rect width="${LIENZO}" height="${LIENZO}" rx="${Math.round(LIENZO * 0.2)}" fill="${TINTA}"/>
  <rect x="${m}" y="${m}" width="${LIENZO - m * 2}" height="${LIENZO - m * 2}"
        fill="none" stroke="url(#llama)" stroke-width="${grosor}"/>
</svg>`);
}

/**
 * Escribe un .ico. El formato admite PNG adentro desde hace quince anos, asi
 * que alcanza con la cabecera, el indice y los PNG pegados uno detras de otro.
 */
function armarIco(imagenes) {
  const cantidad = imagenes.length;
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0);
  cabecera.writeUInt16LE(1, 2); // 1 = icono
  cabecera.writeUInt16LE(cantidad, 4);

  const indice = Buffer.alloc(16 * cantidad);
  let offset = 6 + 16 * cantidad;

  imagenes.forEach(({ lado, png }, i) => {
    const p = i * 16;
    indice[p] = lado >= 256 ? 0 : lado;
    indice[p + 1] = lado >= 256 ? 0 : lado;
    indice[p + 2] = 0; // colores de paleta
    indice[p + 3] = 0;
    indice.writeUInt16LE(1, p + 4); // planos
    indice.writeUInt16LE(32, p + 6); // bits por pixel
    indice.writeUInt32LE(png.length, p + 8);
    indice.writeUInt32LE(offset, p + 12);
    offset += png.length;
  });

  return Buffer.concat([cabecera, indice, ...imagenes.map((i) => i.png)]);
}

const amp = await siluetaAmpersand();

// El ampersand ocupa el 46% del lienzo: entra holgado dentro del corchete.
const altoAmp = Math.round(LIENZO * 0.46);
const anchoAmp = Math.round((altoAmp * AMP.width) / AMP.height);

const marca = await sharp(fondo())
  .composite([
    {
      input: await sharp(amp).resize(anchoAmp, altoAmp, { kernel: "lanczos3" }).toBuffer(),
      top: Math.round((LIENZO - altoAmp) / 2),
      left: Math.round((LIENZO - anchoAmp) / 2),
    },
  ])
  .png()
  .toBuffer();

await sharp(marca).resize(96, 96, { kernel: "lanczos3" }).toFile("public/favicon-96x96.png");

const lados = [16, 32, 48];
const png = await Promise.all(
  lados.map(async (lado) => ({
    lado,
    png: await sharp(marca).resize(lado, lado, { kernel: "lanczos3" }).png().toBuffer(),
  })),
);

writeFileSync("public/favicon.ico", armarIco(png));

// Copia para revisar el resultado con detalle. No se publica.
await sharp(marca).toFile("docs/marca-ampersand.png");

console.log("favicon-96x96.png y favicon.ico regenerados con el ampersand");
