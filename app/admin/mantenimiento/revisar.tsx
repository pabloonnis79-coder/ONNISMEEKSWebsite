"use client";

import { useFormStatus } from "react-dom";

/**
 * El boton de revisar.
 *
 * Existe aparte para poder mostrar que esta trabajando: la revision tarda varios
 * segundos y sin aviso parece que el boton no anduvo, asi que se aprieta de
 * nuevo y arranca otra corrida encima.
 */
export function Revisar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-full flame-bg px-7 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 disabled:opacity-70"
    >
      {pending ? "Revisando" : "Revisar ahora"}
    </button>
  );
}
