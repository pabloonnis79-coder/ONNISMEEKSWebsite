import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-5 py-32">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-[-0.035em]">
        Panel
      </h1>
      <p className="mt-3 text-sm text-paper-dim">
        Acceso solo para el equipo del estudio.
      </p>

      {configured ? (
        /*
          El formulario lee la direccion a la que se queria entrar, y eso no se
          sabe hasta que llega la peticion. Este limite le da a Next algo que
          mostrar mientras tanto y le permite generar el resto de la pagina de
          antemano.
        */
        <div className="mt-10">
          <Suspense fallback={<div className="h-40" />}>
            <LoginForm />
          </Suspense>
        </div>
      ) : (
        <p className="mt-10 border border-line px-5 py-6 text-sm leading-relaxed text-paper-dim">
          Supabase todavía no está configurado. Cargá{" "}
          <code className="font-mono text-flame-warm">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code className="font-mono text-flame-warm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          en el archivo de entorno y volvé a entrar.
        </p>
      )}
    </div>
  );
}
