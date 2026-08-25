/**
 * Achica una imagen antes de subirla.
 *
 * El plan gratuito de Supabase da unos 10 GB de trafico por mes. Una galeria
 * con siete PNG de doce megas se come ese mes en trescientas visitas, y nadie
 * que sube una foto desde el panel tiene por que saber eso. Asi que el panel lo
 * hace solo.
 *
 * Se convierte a WebP y no a JPEG porque los logos de marcas tienen fondo
 * transparente: en JPEG ese fondo sale negro.
 */

/** Lado mayor. Alcanza para pantalla completa en cualquier monitor. */
const LADO_MAXIMO = 2400;

/** Calidad de la reconversion. Arriba de esto casi no se gana peso. */
const CALIDAD = 0.85;

export type Achicada = {
  archivo: File;
  /** Bytes antes y despues, para poder contarlo en pantalla. */
  antes: number;
  despues: number;
};

/**
 * Devuelve la version achicada, o el archivo original si no habia nada que
 * ganar: un logo de 20 KB no mejora por pasar por acá, y un video no se toca.
 */
export async function achicarImagen(file: File): Promise<Achicada> {
  const sinCambios = { archivo: file, antes: file.size, despues: file.size };

  // Los videos y los formatos que no sabemos dibujar pasan de largo.
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return sinCambios;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Si el navegador no puede abrirla, se sube tal cual: mejor una foto
    // pesada que ninguna foto.
    return sinCambios;
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;

  const ctx = lienzo.getContext("2d");
  if (!ctx) return sinCambios;

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    lienzo.toBlob(resolve, "image/webp", CALIDAD),
  );

  // Si la conversion no achico nada, se queda el original. Pasa con imagenes
  // ya optimizadas, donde volver a comprimir solo suma perdida.
  if (!blob || blob.size >= file.size) return sinCambios;

  const nombre = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return {
    archivo: new File([blob], nombre, { type: "image/webp" }),
    antes: file.size,
    despues: blob.size,
  };
}
