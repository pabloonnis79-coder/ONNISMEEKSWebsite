/**
 * Contenido editorial que no viene de YouTube. Se carga a mano acá y las
 * páginas se adaptan solas a la cantidad de items que haya.
 */

export type Award = {
  name: string;
  category: string;
  year: number;
  organization: string;
  project?: string;
  projectSlug?: string;
  result: "Ganador" | "Finalista" | "Mención" | "Selección oficial";
};

// TODO: cargar los premios y selecciones reales del estudio.
export const awards: Award[] = [];

export type TeamMember = {
  name: string;
  role: string;
  photo?: string;
};

// TODO: cargar el equipo con fotos reales (retrato vertical, mínimo 800x1000).
export const team: TeamMember[] = [];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingMinutes: number;
  cover?: string;
};

// TODO: primeras notas del estudio.
export const posts: Post[] = [];
