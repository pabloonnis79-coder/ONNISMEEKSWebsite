import "server-only";

import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";
import { getBrandLogos, leerAjuste } from "@/lib/db/settings";
import { getVideos, isYouTubeConfigured } from "@/lib/youtube/api";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Clave donde queda guardada la ultima revision del sitio. */
export const CLAVE_REVISION = "maintenance_report";

/**
 * `problema` es lo que un visitante puede ver roto hoy. `revisar` es lo que
 * conviene mirar pero no rompe nada. La diferencia importa: si todo grita, no
 * se mira nada.
 */
export type Estado = "bien" | "revisar" | "problema";

export type Chequeo = {
  id: string;
  titulo: string;
  estado: Estado;
  /** Una linea. Es lo unico que se lee de apuro. */
  resumen: string;
  /** Los casos concretos, para poder ir a arreglarlos. */
  detalle?: string[];
  /** Que hacer al respecto, cuando no es obvio. */
  ayuda?: string;
};

export type Revision = {
  /** Cuando se corrio. La pantalla la muestra: un informe viejo engaña. */
  fecha: string;
  chequeos: Chequeo[];
};

/* ----------------------------------------------------------- los chequeos -- */

/**
 * Los videos que estan en una ficha pero ya no se pueden ver.
 *
 * Es el unico problema de esta lista que le llega al visitante: la ficha abre
 * con un reproductor muerto. Pasa sin que nadie toque el sitio —alcanza con
 * poner el video en privado en YouTube— y por eso no se entera nadie hasta que
 * lo abre un cliente.
 */
async function chequearVideos(proyectos: any[]): Promise<Chequeo> {
  const base = { id: "videos", titulo: "Videos de las fichas" };

  if (!isYouTubeConfigured()) {
    return {
      ...base,
      estado: "revisar",
      resumen: "No pude revisarlos: falta la clave de YouTube.",
    };
  }

  const conVideo = proyectos.filter((p) => p.youtube_id);
  if (conVideo.length === 0) {
    return { ...base, estado: "bien", resumen: "Todavía no hay fichas con video." };
  }

  const vivos = new Set((await getVideos(conVideo.map((p) => p.youtube_id))).map((v) => v.id));
  const caidos = conVideo.filter((p) => !vivos.has(p.youtube_id));

  if (caidos.length === 0) {
    return {
      ...base,
      estado: "bien",
      resumen: `Los ${conVideo.length} videos se ven bien.`,
    };
  }

  return {
    ...base,
    estado: "problema",
    resumen: `${caidos.length} de ${conVideo.length} no se pueden ver.`,
    detalle: caidos.map((p) => `${p.project_name || p.title} · /proyectos/${p.slug}`),
    ayuda:
      "El video se borró del canal o quedó en privado. Poné el video en público de nuevo, o elegí otro desde la ficha del proyecto.",
  };
}

/**
 * Los sitios de los clientes del carrusel.
 *
 * Nunca dice "está roto". Muchos sitios contestan mal a una visita automatica
 * —bloqueo de robots, o piden navegador— y quedarian marcados como caidos
 * estando perfectos. Lo unico honesto es decir cual no se pudo confirmar y que
 * lo abra una persona.
 */
/**
 * Un navegador cualquiera. Muchos sitios contestan mal —o no contestan— a un
 * pedido sin identificacion, porque asi frenan a los robots que los rastrean.
 */
const NAVEGADOR =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

/**
 * Visita un sitio. Devuelve el problema, o null si contesta.
 *
 * Primero pregunta si existe (HEAD, que no baja la pagina) y si eso no sale
 * bien la pide entera (GET). Hay servidores que directamente no saben responder
 * la primera pregunta: el sitio de CBSE deja la consulta colgada hasta que
 * vence el tiempo, y abre perfecto en cualquier navegador. Quedarse en el
 * primer intento es acusar de caido a un sitio que anda.
 */
async function visitar(url: string): Promise<string | null> {
  const opciones = {
    headers: { "user-agent": NAVEGADOR, accept: "text/html" },
    redirect: "follow" as const,
    cache: "no-store" as const,
  };

  let ultimo = "no contestó";

  /*
    El primer intento espera poco y el segundo espera lo que haga falta. Un
    sitio que ignora la pregunta corta no va a contestarla por esperarlo mas, y
    esos segundos los paga la revision entera: con quince en los dos, un solo
    sitio mudo la estiraba de dos segundos a dieciocho.
  */
  for (const [method, espera] of [["HEAD", 5000], ["GET", 12000]] as const) {
    try {
      const res = await fetch(url, { ...opciones, method, signal: AbortSignal.timeout(espera) });
      if (res.ok) return null;
      ultimo = `respondió ${res.status}`;
    } catch {
      ultimo = "no contestó";
    }
  }

  return ultimo;
}

async function chequearEnlaces(): Promise<Chequeo> {
  const base = { id: "enlaces", titulo: "Sitios de los clientes" };
  const marcas = (await getBrandLogos()).filter((m) => /^https?:\/\//.test(m.sitio));

  if (marcas.length === 0) {
    return { ...base, estado: "bien", resumen: "No hay sitios cargados." };
  }

  const dudosos: string[] = [];

  await Promise.all(marcas.map(async (m) => {
    const problema = await visitar(m.sitio);
    if (problema) dudosos.push(`${m.nombre} · ${m.sitio} · ${problema}`);
  }));

  if (dudosos.length === 0) {
    return { ...base, estado: "bien", resumen: `Los ${marcas.length} sitios contestan.` };
  }

  return {
    ...base,
    estado: "revisar",
    resumen: `${dudosos.length} de ${marcas.length} no pude confirmarlos.`,
    detalle: dudosos.sort(),
    ayuda:
      "Abrilos a mano antes de tocar nada. Que no me contesten a mí no significa que estén caídos: hay sitios que rechazan las visitas automáticas.",
  };
}

/**
 * Cuanto le falta a las fichas para estar completas.
 *
 * No rompe nada. Es la diferencia entre un sitio que parece terminado y uno que
 * parece a medio cargar.
 */
function chequearFichas(proyectos: any[]): Chequeo {
  const base = { id: "fichas", titulo: "Fichas completas" };
  const publicados = proyectos.filter((p) => p.status === "published" && !p.hidden);

  if (publicados.length === 0) {
    return { ...base, estado: "revisar", resumen: "No hay ningún proyecto publicado." };
  }

  const faltantes: Array<[string, number]> = [
    ["sin historia", publicados.filter((p) => !p.story).length],
    ["sin cliente", publicados.filter((p) => !p.client_name).length],
    ["sin rubro", publicados.filter((p) => !p.category).length],
    ["sin portada", publicados.filter((p) => !p.cover_url).length],
  ];

  const detalle = faltantes.filter(([, n]) => n > 0).map(([q, n]) => `${n} ${q}`);

  if (detalle.length === 0) {
    return {
      ...base,
      estado: "bien",
      resumen: `Las ${publicados.length} fichas están completas.`,
    };
  }

  return {
    ...base,
    estado: "revisar",
    resumen: `De ${publicados.length} publicadas: ${detalle.join(", ")}.`,
    ayuda: "Se completan desde cada proyecto. No urge, pero es lo que hace que el sitio se vea terminado.",
  };
}

/** Que la portada muestre lo que ustedes eligen y no lo ultimo que salio. */
function chequearDestacados(proyectos: any[]): Chequeo {
  const base = { id: "destacados", titulo: "Destacados de la portada" };
  const destacados = proyectos.filter((p) => p.featured && p.status === "published" && !p.hidden);

  if (destacados.length === 0) {
    return {
      ...base,
      estado: "revisar",
      resumen: "Ninguno está marcado como destacado.",
      ayuda:
        "La portada está mostrando lo último que salió. Marcá los trabajos que quieran mostrar primero desde la lista de proyectos.",
    };
  }

  return {
    ...base,
    estado: "bien",
    resumen: `${destacados.length} en la portada.`,
  };
}

/** Hace cuanto que no entra material nuevo del canal. */
function chequearSincronizacion(proyectos: any[]): Chequeo {
  const base = { id: "sincronizacion", titulo: "Sincronización con el canal" };
  const fechas = proyectos.map((p) => p.synced_at).filter(Boolean).sort();
  const ultima = fechas[fechas.length - 1];

  if (!ultima) {
    return { ...base, estado: "revisar", resumen: "Nunca se sincronizó." };
  }

  const dias = Math.floor((Date.now() - new Date(ultima).getTime()) / 86_400_000);

  return {
    ...base,
    estado: dias > 7 ? "revisar" : "bien",
    resumen:
      dias === 0 ? "Se sincronizó hoy." : dias === 1 ? "Se sincronizó ayer." : `Hace ${dias} días.`,
    ayuda: dias > 7 ? "Si subieron videos al canal, todavía no están en el sitio." : undefined,
  };
}

/**
 * Archivos que quedaron en el servidor y ya no muestra nadie.
 *
 * Se juntan solos: cada vez que se reemplaza un logo o una foto, la anterior
 * queda ahi. No molesta hasta que llena el lugar disponible.
 *
 * Solo avisa. Borrar es otra cosa y va aparte: un archivo que hoy parece
 * huérfano puede estar en un texto que todavia no lei.
 */
async function chequearArchivos(proyectos: any[], ajustes: any[]): Promise<Chequeo> {
  const base = { id: "archivos", titulo: "Archivos guardados" };

  if (!isSupabaseConfigured()) {
    return { ...base, estado: "revisar", resumen: "No pude leer el almacenamiento." };
  }

  const usado = JSON.stringify(proyectos) + JSON.stringify(ajustes);
  const supabase = createPublicClient();

  let total = 0;
  let bytes = 0;
  let sueltos = 0;
  let bytesSueltos = 0;

  for (const carpeta of ["autoridades", "marcas", "portadas", "proyectos"]) {
    const { data, error } = await supabase.storage.from("media").list(carpeta, { limit: 1000 });
    if (error) continue;

    for (const f of data ?? []) {
      const tamano = (f.metadata as any)?.size ?? 0;
      total += 1;
      bytes += tamano;

      if (!usado.includes(f.name)) {
        sueltos += 1;
        bytesSueltos += tamano;
      }
    }
  }

  const mb = (n: number) => `${(n / 1_048_576).toFixed(1)} MB`;

  if (sueltos === 0) {
    return { ...base, estado: "bien", resumen: `${total} archivos, ${mb(bytes)} en total.` };
  }

  return {
    ...base,
    estado: "revisar",
    resumen: `${sueltos} de ${total} archivos ya no se usan (${mb(bytesSueltos)} de ${mb(bytes)}).`,
    ayuda:
      "Son fotos y logos que reemplazaste. No molestan mientras haya lugar; se van a poder borrar desde acá más adelante.",
  };
}

/* -------------------------------------------------------------- la corrida -- */

/**
 * Corre todos los chequeos.
 *
 * En paralelo, porque el de videos habla con YouTube y el de enlaces con una
 * decena de sitios ajenos: en fila seria una espera larga sin motivo.
 */
export async function correrRevision(supabase: any): Promise<Revision> {
  const [{ data: proyectos }, { data: ajustes }] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("site_settings").select("key, value"),
  ]);

  const p = proyectos ?? [];
  const a = ajustes ?? [];

  const chequeos = await Promise.all([
    chequearVideos(p),
    chequearEnlaces(),
    Promise.resolve(chequearDestacados(p)),
    Promise.resolve(chequearFichas(p)),
    Promise.resolve(chequearSincronizacion(p)),
    chequearArchivos(p, a),
  ]);

  // Primero lo que esta mal. Lo que anda bien se lee al final, o no se lee.
  const orden: Record<Estado, number> = { problema: 0, revisar: 1, bien: 2 };
  chequeos.sort((x, y) => orden[x.estado] - orden[y.estado]);

  return { fecha: new Date().toISOString(), chequeos };
}

/** La ultima revision guardada, para no tener que correrla al abrir. */
export async function getUltimaRevision(): Promise<Revision | null> {
  const value = (await leerAjuste(CLAVE_REVISION)) as Revision | null;
  if (!value || typeof value !== "object" || !Array.isArray(value.chequeos)) return null;
  return value;
}
