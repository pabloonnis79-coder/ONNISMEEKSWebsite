import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { FirmaCard } from "./firma-card";
import { getAuthorities } from "@/lib/db/settings";
import { construirFirma } from "@/lib/firma";

export const metadata: Metadata = {
  title: "Firmas de correo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FirmasPage() {
  const personas = await getAuthorities();

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
        Firmas de correo
      </h1>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-paper-dim">
        Una para cada persona del equipo, armada sola con los datos de{" "}
        <Link href="/admin/autoridades" className="text-flame-warm hover:opacity-70">
          Autoridades
        </Link>
        . Si cambiás un cargo o una foto ahí, la firma se actualiza acá.
      </p>

      <section className="mt-8 border border-line p-5">
        <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-flame">
          Cómo ponerla en tu correo
        </h2>
        <ol className="ml-4 list-decimal space-y-2 text-sm leading-relaxed text-paper-dim marker:text-paper-faint">
          <li>
            Buscá tu nombre acá abajo y apretá <strong className="text-paper">Copiar firma</strong>.
          </li>
          <li>
            Entrá a{" "}
            <a
              href="https://mail.zoho.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame-warm hover:opacity-70"
            >
              mail.zoho.com
            </a>{" "}
            con tu cuenta.
          </li>
          <li>
            Engranaje (arriba a la derecha) → <strong className="text-paper">Configuración</strong>.
          </li>
          <li>
            Menú de la izquierda → <strong className="text-paper">Correo</strong> →{" "}
            <strong className="text-paper">Firmas</strong>.
          </li>
          <li>
            <strong className="text-paper">Nueva firma</strong>, ponele un nombre
            cualquiera y pegá dentro del editor con <strong className="text-paper">Ctrl+V</strong>.
          </li>
          <li>
            Abajo, en <strong className="text-paper">Asociar a</strong>, elegí tu
            cuenta y marcá que se use en correos nuevos y en respuestas. Guardá.
          </li>
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-paper-faint">
          Si al pegar se ve todo en negro y sin formato, deshacé con Ctrl+Z y
          usá la versión sin foto. Algunos editores rechazan las imágenes
          externas.
        </p>
      </section>

      {personas.length === 0 ? (
        <p className="mt-12 border border-line p-8 text-sm text-paper-dim">
          Todavía no hay nadie cargado en{" "}
          <Link href="/admin/autoridades" className="text-flame-warm hover:opacity-70">
            Autoridades
          </Link>
          .
        </p>
      ) : (
        <div className="mt-14 flex flex-col gap-16">
          {personas.map((p, i) => {
            const datos = {
              nombre: p.nombre,
              apellido: p.apellido,
              cargo: p.cargo,
              email: p.email,
              foto: p.foto,
            };

            return (
              <section key={`${p.nombre}-${i}`}>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-[-0.03em]">
                  {p.nombre} {p.apellido}
                </h2>

                {!p.email && (
                  <p className="mt-3 border border-flame/40 bg-flame/10 px-4 py-3 text-sm text-flame-warm">
                    Falta el correo. Cargalo en{" "}
                    <Link href="/admin/autoridades" className="underline">
                      Autoridades
                    </Link>{" "}
                    y la firma lo toma solo.
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-5">
                  {p.foto && (
                    <FirmaCard
                      titulo="Con foto"
                      html={construirFirma(datos, true)}
                      nota="Probá esta primero. Es la que mejor queda."
                    />
                  )}

                  <FirmaCard
                    titulo="Sin foto"
                    html={construirFirma(datos, false)}
                    nota="Para usar si la imagen no aparece en el correo de quien lo recibe."
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
