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

/** Todos los campos en una sola lista, para buscar por id. */
export const CAMPOS: CampoTexto[] = GRUPOS.flatMap((g) => g.campos);

/** Los valores originales, que son los que se usan mientras nadie edite nada. */
export const TEXTOS_POR_DEFECTO: Record<string, string> = Object.fromEntries(
  CAMPOS.map((c) => [c.id, c.valor]),
);
