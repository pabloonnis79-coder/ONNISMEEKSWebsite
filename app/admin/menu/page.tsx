import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { SectionsForm, type Seccion } from "./sections-form";
import { getSeccionesOcultas } from "@/lib/db/settings";
import { getFeaturedProjects } from "@/lib/db/projects";
import { awards, posts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Secciones del sitio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const ocultas = await getSeccionesOcultas();

  /*
    Detras de camara no tiene lista propia: sale del material extra de los
    proyectos. Se cuenta lo mismo que muestra la pagina, o el numero mentiria.
  */
  const proyectos = await getFeaturedProjects(200);
  const material = proyectos.reduce(
    (n, p) => n + p.makingOf.length + p.gallery.length,
    0,
  );

  const secciones: Seccion[] = [
    { href: "/premios", label: "Premios", cuantas: awards.length, unidad: "premios" },
    { href: "/notas", label: "Notas", cuantas: posts.length, unidad: "notas" },
    {
      href: "/detras-de-camara",
      label: "Detrás de cámara",
      cuantas: material,
      unidad: "piezas",
    },
  ];

  return (
    <div className="mx-auto max-w-[900px] px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-paper-dim transition-colors hover:text-paper"
      >
        <ArrowLeftIcon size={15} weight="bold" />
        Volver al panel
      </Link>

      <h1 className="mt-8 font-display text-3xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
        Secciones del sitio
      </h1>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-dim">
        Qué secciones se muestran. Destildá las que todavía no tengan contenido:
        una sección vacía en el menú principal resta más de lo que suma.
      </p>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-faint">
        Apagar una la saca del menú y del pie, la borra del mapa que lee Google,
        y quien entre por un enlace viejo ve la pantalla de «esta página no
        existe». Se vuelve a encender cuando quieras y aparece igual que antes:
        no se borra nada.
      </p>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-faint">
        Acá están sólo las tres que pueden quedar sin nada adentro. Las demás
        —Proyectos, Servicios, Clientes, Estudio y Contacto— están enlazadas
        desde adentro del sitio, y apagarlas dejaría botones que no llevan a
        ningún lado.
      </p>

      <div className="mt-12">
        <SectionsForm secciones={secciones} ocultas={ocultas} />
      </div>
    </div>
  );
}
