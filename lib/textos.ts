/**
 * Los textos del sitio que se pueden editar desde el panel.
 *
 * Cada campo trae su valor original. Ese valor es el que se muestra mientras
 * nadie lo haya tocado, y sigue siendo el respaldo despues: en la base se
 * guarda solamente lo que se cambio. Asi, si manana se corrige un texto en el
 * codigo, la correccion llega a quien no lo haya reescrito, en vez de quedar
 * tapada por una copia vieja guardada el primer dia.
 *
 * El id no se cambia nunca una vez publicado: es la llave con la que se guarda
 * lo editado. Cambiarlo equivale a perder el texto que el estudio haya escrito.
 */

import { capabilities, services } from "@/lib/site";

export type CampoTexto = {
  id: string;
  etiqueta: string;
  ayuda?: string;
  /** "parrafo" dibuja un area de varias lineas en el panel. */
  largo?: "linea" | "parrafo";
  valor: string;
};

export type GrupoTexto = {
  titulo: string;
  descripcion?: string;
  campos: CampoTexto[];
};

export const GRUPOS: GrupoTexto[] = [
  {
    titulo: "Portada, arriba de todo",
    descripcion:
      "Lo primero que se ve, sobre el video. El título va en dos líneas: la segunda se muestra en naranja.",
    campos: [
      {
        id: "home.hero.titulo1",
        etiqueta: "Título, primera línea",
        valor: "Creamos contenido",
      },
      {
        id: "home.hero.titulo2",
        etiqueta: "Título, segunda línea",
        ayuda: "Se muestra con el degradé naranja de la marca.",
        valor: "que impulsa marcas",
      },
      {
        id: "home.hero.bajada",
        etiqueta: "Bajada",
        largo: "parrafo",
        valor:
          "Estrategia, producción y postproducción para empresas que quieren diferenciarse.",
      },
    ],
  },
  {
    titulo: "Trabajos destacados",
    campos: [
      { id: "home.trabajos.antetitulo", etiqueta: "Antetítulo", valor: "Trabajos" },
      {
        id: "home.trabajos.titulo",
        etiqueta: "Título",
        valor: "Lo último que salió del estudio",
      },
      { id: "home.trabajos.enlace", etiqueta: "Texto del enlace", valor: "Ver todos" },
    ],
  },
  {
    titulo: "Reels",
    campos: [
      { id: "home.reels.antetitulo", etiqueta: "Antetítulo", valor: "Formato vertical" },
      { id: "home.reels.titulo", etiqueta: "Título", valor: "Piezas para redes" },
    ],
  },
  {
    titulo: "Frase del estudio",
    descripcion: "El bloque de fondo gris, entre los trabajos y el equipo.",
    campos: [
      {
        id: "home.manifiesto.titulo",
        etiqueta: "Frase",
        largo: "parrafo",
        ayuda: "Las últimas palabras se muestran en naranja, hasta el punto final.",
        valor: "Un rodaje bien pensado se nota tres años después.",
      },
      {
        id: "home.manifiesto.resaltado",
        etiqueta: "Parte en naranja",
        ayuda: "Tiene que ser un pedazo exacto de la frase de arriba.",
        valor: "tres años después",
      },
      {
        id: "home.manifiesto.texto",
        etiqueta: "Párrafo",
        largo: "parrafo",
        valor:
          "Trabajamos con equipos de marketing que ya saben lo que quieren decir y necesitan que se vea bien dicho. Definimos el plan con el presupuesto sobre la mesa, filmamos con el equipo justo y entregamos todas las versiones que pide cada canal.",
      },
    ],
  },
  {
    titulo: "Quiénes dirigen",
    descripcion: "Las personas se cargan en la pantalla de Autoridades.",
    campos: [
      { id: "home.autoridades.titulo", etiqueta: "Título", valor: "Quiénes dirigen" },
    ],
  },
  {
    titulo: "Marcas",
    campos: [
      { id: "home.marcas.titulo", etiqueta: "Título", valor: "Confían en nosotros" },
    ],
  },
  {
    titulo: "Cómo trabajamos",
    descripcion: "Los tres pasos del proceso.",
    campos: [
      {
        id: "home.proceso.titulo",
        etiqueta: "Título",
        ayuda: "Se parte en dos líneas por el espacio.",
        valor: "Cómo trabajamos",
      },
      {
        id: "home.proceso.bajada",
        etiqueta: "Bajada",
        largo: "parrafo",
        valor:
          "Tres momentos, un solo interlocutor. No hay reventa de servicios ni equipos que aparecen recién el día del rodaje.",
      },
      { id: "home.proceso.paso1.titulo", etiqueta: "Paso 1, título", valor: "Pensar" },
      {
        id: "home.proceso.paso1.texto",
        etiqueta: "Paso 1, texto",
        largo: "parrafo",
        valor:
          "Leemos el brief, discutimos el objetivo real y devolvemos un tratamiento con presupuesto cerrado. Si hay que cambiar la idea para que entre en el presupuesto, lo decimos antes y no después.",
      },
      { id: "home.proceso.paso2.titulo", etiqueta: "Paso 2, título", valor: "Filmar" },
      {
        id: "home.proceso.paso2.texto",
        etiqueta: "Paso 2, texto",
        largo: "parrafo",
        valor:
          "Plan de rodaje, equipo técnico y permisos a cargo nuestro. La marca aprueba la dirección de arte antes de que se encienda la primera luz.",
      },
      { id: "home.proceso.paso3.titulo", etiqueta: "Paso 3, título", valor: "Terminar" },
      {
        id: "home.proceso.paso3.texto",
        etiqueta: "Paso 3, texto",
        largo: "parrafo",
        valor:
          "Montaje, color, sonido y todas las versiones que necesita cada canal. Se entrega el máster y los archivos fuente, con los nombres ordenados.",
      },
    ],
  },
  {
    titulo: "Cierre de la portada",
    campos: [
      {
        id: "home.contacto.titulo",
        etiqueta: "Título",
        valor: "Contanos qué hay que filmar",
      },
      { id: "home.contacto.enlace", etiqueta: "Texto del botón", valor: "Contacto" },
    ],
  },
];

GRUPOS.push(
  {
    titulo: "Página Estudio",
    campos: [
      {
        id: "estudio.titulo",
        etiqueta: "Título",
        valor: "Un estudio, todo el proceso",
      },
      {
        id: "estudio.resaltado",
        etiqueta: "Parte en naranja",
        ayuda: "Tiene que ser un pedazo exacto del título.",
        valor: "todo el proceso",
      },
      {
        id: "estudio.parrafo1",
        etiqueta: "Primer párrafo",
        largo: "parrafo",
        ayuda:
          "Se puede escribir {año} y {años} y el sitio los completa con el año de fundación y los años que lleva el estudio.",
        valor:
          "ONNIS & MEEKS trabaja desde {año} produciendo piezas audiovisuales para marcas, organizaciones y agencias. En {años} años armamos un equipo que cubre todas las etapas, desde la idea hasta el archivo final entregado.",
      },
      {
        id: "estudio.parrafo2",
        etiqueta: "Segundo párrafo",
        largo: "parrafo",
        valor:
          "No tercerizamos las decisiones importantes. La misma persona que escucha el brief está en el rodaje y firma el corte final. Eso hace que la pieza que se aprueba sea la pieza que se entrega.",
      },
      {
        id: "estudio.parrafo3",
        etiqueta: "Tercer párrafo",
        largo: "parrafo",
        valor:
          "Trabajamos con presupuesto cerrado. Si algo no entra, lo decimos antes de firmar y proponemos cómo resolverlo de otra manera.",
      },
      {
        id: "estudio.capacidades.titulo",
        etiqueta: "Título de la lista",
        valor: "Lo que producimos",
      },
      {
        id: "estudio.capacidades.items",
        etiqueta: "Lo que producimos",
        ayuda: "Uno por línea.",
        largo: "parrafo",
        valor: capabilities.join("\n"),
      },
      { id: "estudio.equipo.titulo", etiqueta: "Título del equipo", valor: "Equipo" },
      {
        id: "estudio.cierre.titulo",
        etiqueta: "Cierre, título",
        valor: "Contanos qué hay que filmar",
      },
      { id: "estudio.cierre.enlace", etiqueta: "Cierre, botón", valor: "Contacto" },
    ],
  },
  {
    titulo: "Página Contacto",
    campos: [
      {
        id: "contacto.titulo",
        etiqueta: "Título",
        valor: "Contanos qué hay que filmar",
      },
      {
        id: "contacto.bajada",
        etiqueta: "Bajada",
        largo: "parrafo",
        valor:
          "Contestamos dentro de las 48 horas hábiles. Si ya tenés brief, adjuntalo por correo y ganamos una vuelta.",
      },
    ],
  },
  {
    titulo: "Página Proyectos",
    campos: [
      { id: "proyectos.titulo", etiqueta: "Título", valor: "Proyectos" },
      {
        id: "proyectos.bajada",
        etiqueta: "Bajada",
        largo: "parrafo",
        valor:
          "Cada ficha se arma sola con lo que publicamos en YouTube. Filtrá por cliente, año, categoría o servicio.",
      },
      {
        id: "proyectos.vacio.titulo",
        etiqueta: "Sin resultados, título",
        ayuda: "Se ve cuando un filtro no devuelve nada.",
        valor: "No hay proyectos con ese filtro",
      },
    ],
  },
  {
    titulo: "Página Clientes",
    campos: [
      { id: "clientes.titulo", etiqueta: "Título", valor: "Clientes" },
      {
        id: "clientes.bajada",
        etiqueta: "Bajada",
        largo: "parrafo",
        valor:
          "La ficha de cada marca reúne todo lo que filmamos con ella, con los servicios que contrató y el año de cada pieza.",
      },
      {
        id: "clientes.vacio",
        etiqueta: "Sin clientes todavía",
        largo: "parrafo",
        valor:
          "Todavía no hay clientes cargados. Se crean solos con la primera sincronización del canal.",
      },
    ],
  },
);

/**
 * Los cinco servicios.
 *
 * Los campos se arman desde la lista que ya existe en lib/site, en vez de
 * copiarlos a mano: asi el valor original no puede quedar desfasado del codigo.
 *
 * El slug no se toca desde el panel a proposito: es la direccion de la pagina
 * del servicio. Cambiarlo romperia los enlaces que alguien haya compartido.
 */
GRUPOS.push({
  titulo: "Servicios",
  descripcion:
    "Los cinco bloques de la portada y sus páginas. La dirección de cada página no cambia aunque cambie el nombre.",
  campos: services.flatMap((s) => [
    {
      id: `servicio.${s.slug}.nombre`,
      etiqueta: `${s.name} — nombre`,
      valor: s.name,
    },
    {
      id: `servicio.${s.slug}.resumen`,
      etiqueta: `${s.name} — descripción`,
      ayuda: "Se ve en la portada y arriba de la página del servicio.",
      largo: "parrafo",
      valor: s.summary,
    },
    {
      id: `servicio.${s.slug}.incluye`,
      etiqueta: `${s.name} — qué incluye`,
      ayuda: "Uno por línea. Es la lista que aparece en la página del servicio.",
      largo: "parrafo",
      valor: s.includes.join("\n"),
    },
  ]),
});

/** Todos los campos en una sola lista, para buscar por id. */
export const CAMPOS: CampoTexto[] = GRUPOS.flatMap((g) => g.campos);

/** Los valores originales, que son los que se usan mientras nadie edite nada. */
export const TEXTOS_POR_DEFECTO: Record<string, string> = Object.fromEntries(
  CAMPOS.map((c) => [c.id, c.valor]),
);
