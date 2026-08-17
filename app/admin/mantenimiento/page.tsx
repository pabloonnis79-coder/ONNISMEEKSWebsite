import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { runRevision } from "@/app/admin/actions";
import { getUltimaRevision, type Chequeo, type Estado } from "@/lib/db/mantenimiento";
import { Revisar } from "./revisar";

export const metadata: Metadata = {
  title: "Mantenimiento",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const fecha = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

/*
  Tres estados y nada mas. Un semaforo con doce colores no lo lee nadie: lo que
  tiene que quedar claro de una mirada es si hay algo roto ahora mismo.
*/
const SEMAFORO: Record<Estado, { punto: string; texto: string; etiqueta: string }> = {
  problema: { punto: "bg-flame", texto: "text-flame", etiqueta: "Roto" },
  revisar: { punto: "bg-flame-warm/60", texto: "text-flame-warm", etiqueta: "Para mirar" },
  bien: { punto: "bg-paper-faint/40", texto: "text-paper-faint", etiqueta: "Bien" },
};

function Tarjeta({ c }: { c: Chequeo }) {
  const s = SEMAFORO[c.estado];

  return (
    <li className="border-t border-line py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="flex items-center gap-3 font-display text-lg font-extrabold uppercase leading-none tracking-[-0.03em]">
          <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${s.punto}`} />
          {c.titulo}
        </h3>
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.14em] ${s.texto}`}
        >
          {s.etiqueta}
        </span>
      </div>

      <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-paper">{c.resumen}</p>

      {c.detalle && c.detalle.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {c.detalle.map((d) => (
            <li key={d} className="font-mono text-[12px] leading-relaxed text-paper-dim">
              {d}
            </li>
          ))}
        </ul>
      )}

      {c.ayuda && (
        <p className="mt-3 max-w-[70ch] text-xs leading-relaxed text-paper-faint">{c.ayuda}</p>
      )}
    </li>
  );
}

export default async function MantenimientoPage() {
  const revision = await getUltimaRevision();
  const problemas = revision?.chequeos.filter((c) => c.estado === "problema").length ?? 0;

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
        Mantenimiento
      </h1>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-dim">
        Una revisión del sitio: qué se ve roto, qué conviene completar y qué se
        está juntando sin usarse. Solo mira, no toca nada.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-5 border-y border-line py-6">
        <form action={runRevision}>
          <Revisar />
        </form>

        {revision ? (
          <p className="text-sm text-paper-dim">
            Última revisión: {fecha.format(new Date(revision.fecha))}
            {problemas > 0 && (
              <>
                {" · "}
                <span className="text-flame">
                  {problemas === 1 ? "1 cosa rota" : `${problemas} cosas rotas`}
                </span>
              </>
            )}
          </p>
        ) : (
          <p className="text-sm text-paper-dim">Todavía no se revisó nunca.</p>
        )}
      </div>

      <p className="mt-4 max-w-[64ch] text-xs leading-relaxed text-paper-faint">
        La revisión tarda unos segundos: consulta el canal de YouTube y abre los
        sitios de los clientes uno por uno. Por eso va con un botón y no sola.
        Con revisarla cada tanto alcanza.
      </p>

      {revision && (
        <ul className="mt-12 flex flex-col">
          {revision.chequeos.map((c) => (
            <Tarjeta key={c.id} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
