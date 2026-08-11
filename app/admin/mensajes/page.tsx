import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { deleteAllSpam, deleteMessage, setMessageSource } from "@/app/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mensajes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Mensaje = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  message: string;
  source: string | null;
  created_at: string;
};

async function leerMensajes(): Promise<Mensaje[]> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id,name,email,company,budget,message,source,created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("[admin/mensajes]", error.message);
    return [];
  }

  return (data ?? []) as Mensaje[];
}

const fecha = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

const accion =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-faint transition-colors hover:text-flame-warm";

function Tarjeta({ m, esSpam }: { m: Mensaje; esSpam: boolean }) {
  return (
    <li className="border-t border-line py-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-display text-lg font-extrabold uppercase leading-none tracking-[-0.03em]">
          {m.name}
        </p>
        <time
          dateTime={m.created_at}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper-faint"
        >
          {fecha.format(new Date(m.created_at))}
        </time>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-paper-dim">
        <a
          href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: tu consulta a ${site.name}`)}`}
          className="text-flame-warm transition-opacity hover:opacity-70"
        >
          {m.email}
        </a>
        {m.company && <span>{m.company}</span>}
        {m.budget && <span>Presupuesto: {m.budget}</span>}
      </div>

      <p className="mt-4 max-w-[80ch] whitespace-pre-wrap text-sm leading-relaxed text-paper">
        {m.message}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <form action={setMessageSource}>
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="source" value={esSpam ? "web" : "spam"} />
          <button type="submit" className={accion}>
            {esSpam ? "No es spam" : "Marcar como spam"}
          </button>
        </form>

        <form action={deleteMessage}>
          <input type="hidden" name="id" value={m.id} />
          <button type="submit" className={accion}>
            Borrar
          </button>
        </form>
      </div>
    </li>
  );
}

export default async function MensajesPage() {
  const todos = await leerMensajes();
  const consultas = todos.filter((m) => m.source !== "spam");
  const spam = todos.filter((m) => m.source === "spam");

  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-paper-dim transition-colors hover:text-paper"
      >
        <ArrowLeftIcon size={15} weight="bold" />
        Volver al panel
      </Link>

      <h1 className="mt-8 font-display text-3xl font-extrabold uppercase tracking-[-0.035em] md:text-4xl">
        Mensajes
      </h1>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-dim">
        Todo lo que entra por el formulario de{" "}
        <Link href="/contacto" className="text-flame-warm hover:opacity-70">
          /contacto
        </Link>
        . Se guarda acá siempre, aunque falle el aviso por correo. El spam se
        aparta abajo y no dispara ningún aviso.
      </p>

      <section className="mt-12">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Consultas · {consultas.length}
        </h2>

        {consultas.length === 0 ? (
          <p className="mt-6 border border-line p-8 text-sm text-paper-dim">
            Todavía no hay consultas.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col">
            {consultas.map((m) => (
              <Tarjeta key={m.id} m={m} esSpam={false} />
            ))}
          </ul>
        )}
      </section>

      {spam.length > 0 && (
        <section className="mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-faint">
              Spam · {spam.length}
            </h2>

            <form action={deleteAllSpam}>
              <button type="submit" className={accion}>
                Vaciar spam
              </button>
            </form>
          </div>

          <p className="mt-3 max-w-[64ch] text-sm text-paper-faint">
            Revisalos antes de vaciar. Si el filtro se equivocó, el botón
            &ldquo;No es spam&rdquo; lo devuelve arriba.
          </p>

          <ul className="mt-6 flex flex-col opacity-60">
            {spam.map((m) => (
              <Tarjeta key={m.id} m={m} esSpam />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
