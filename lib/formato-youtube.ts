/**
 * El formato de descripcion que convierte un video de YouTube en la pagina de
 * un proyecto. Vive acá y no en un documento aparte para que haya una sola
 * version: la que se ve en el panel es la misma que prueba
 * scripts/probar-formato.mjs contra el parser real.
 */

/** Bloque vacio, listo para pegar en YouTube y completar. */
export const PLANTILLA = `CLIENTE:
PROYECTO:
AÑO:
FECHA:
CATEGORIA:
UBICACION:

SERVICIOS:
Producción audiovisual
Dirección
Postproducción

DESCRIPCION:


RESULTADOS:


CREDITOS:
Dirección:
Dirección de fotografía:
Producción ejecutiva:
Montaje:
Color:
Sonido:

TAGS:

---
Seguinos en Instagram: https://www.instagram.com/onnismeeks`;

/** El mismo formato, completo, para ver cómo queda. */
export const EJEMPLO = `CLIENTE: Movistar
PROYECTO: La red que no se ve
AÑO: 2026
FECHA: 12/03/2026
CATEGORIA: Publicidad
UBICACION: Buenos Aires

SERVICIOS:
Producción audiovisual
Dirección
Color grading

DESCRIPCION:
Movistar necesitaba explicar una inversión en infraestructura sin mostrar
una sola antena. Buscamos el contraste entre lo que la gente hace todos los
días y la red invisible que lo sostiene: filmamos cuatro historias reales en
un solo día de rodaje, con dos unidades y luz natural.

RESULTADOS:
La pieza se emitió en TV abierta durante seis semanas y superó el millón de
reproducciones en YouTube en el primer mes.

CREDITOS:
Dirección: Pablo Onnis
Dirección de fotografía: Nicolás Victoriano
Producción ejecutiva: Soledad Serrano
Montaje: Nicolás Victoriano
Color: Pablo Onnis

TAGS: publicidad, telecomunicaciones, documental de marca

---
Seguinos en Instagram: https://www.instagram.com/onnismeeks`;

export const REGLAS: Array<{ titulo: string; texto: string }> = [
  {
    titulo: "Las mayúsculas y los acentos no importan",
    texto:
      "CLIENTE:, Cliente: y cliente: son lo mismo. AÑO y ANIO también. Lo único que importa es que la palabra termine en dos puntos.",
  },
  {
    titulo: "Cada campo termina donde empieza el siguiente",
    texto:
      "Por eso DESCRIPCION y RESULTADOS pueden ocupar varios párrafos sin necesidad de cerrarlos con nada.",
  },
  {
    titulo: "Los créditos van uno por línea",
    texto:
      "Con el rol adelante y dos puntos: «Dirección: Pablo Onnis». También funciona con guion.",
  },
  {
    titulo: "Los servicios, en líneas separadas o con comas",
    texto: "Las dos formas valen. Lo que sea más cómodo de escribir.",
  },
  {
    titulo: "El «seguinos» va siempre al final",
    texto:
      "Cualquier línea que mencione Instagram, WhatsApp o «suscribite» corta el texto que venía antes. Está hecho a propósito, para que el machete del canal no termine publicado como si fuera el relato del proyecto.",
  },
];

export const OPCIONALES: Array<{ campo: string; para: string }> = [
  {
    campo: "PORTADA:",
    para: "Enlace a una imagen propia. Sin esto se usa la miniatura de YouTube.",
  },
  { campo: "DESTACADO: si", para: "Lo sube a la portada del sitio." },
  { campo: "ORDEN: 1", para: "Fuerza la posición en la grilla. Más chico, más arriba." },
  {
    campo: "GALERIA:",
    para: "Enlaces de fotos, uno por línea. Arma la galería del proyecto.",
  },
  {
    campo: "MAKING OF:",
    para: "Enlaces de YouTube del detrás de cámara, uno por línea.",
  },
];
