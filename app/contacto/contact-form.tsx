"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { sendContactMessage, type ContactState } from "./actions";
import { cn } from "@/lib/utils";

const initial: ContactState = { status: "idle" };

const field =
  "w-full border border-line bg-ink-800 px-4 py-3 text-base text-paper placeholder:text-paper-dim transition-colors focus:border-flame focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full flame-bg px-8 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink transition duration-300 hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Enviando" : "Enviar mensaje"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, initial);

  const cargado = useRef<HTMLInputElement>(null);

  /**
   * Cuándo se abrió el formulario, para medir cuánto tardó en enviarse. Lo
   * pone el navegador y no el servidor: esta página se entrega estática y
   * cacheada, así que el reloj del build no dice nada.
   *
   * Se escribe sobre un campo oculto y no envolviendo la acción, para que el
   * formulario siga enviándose sin JavaScript. Sin JS no hay marca, y eso el
   * filtro lo trata como sospecha leve, no como spam.
   */
  useEffect(() => {
    if (cargado.current) cargado.current.value = String(Date.now());
  }, []);

  if (state.status === "ok") {
    return (
      <div
        role="status"
        className="flex items-start gap-4 border border-flame/50 bg-flame/10 px-6 py-8"
      >
        <CheckCircleIcon size={24} weight="fill" className="mt-0.5 shrink-0 text-flame-warm" />
        <div>
          <h2 className="font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-paper">
            Mensaje enviado
          </h2>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-paper-dim">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-paper">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          className={cn(field, state.fieldErrors?.name && "border-flame")}
        />
        {state.fieldErrors?.name && (
          <p id="name-error" className="text-sm text-flame-warm">
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-paper">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className={cn(field, state.fieldErrors?.email && "border-flame")}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="text-sm text-flame-warm">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="company" className="text-sm font-medium text-paper">
          Marca o empresa
        </label>
        <input
          id="company"
          name="company"
          autoComplete="organization"
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="budget" className="text-sm font-medium text-paper">
          Presupuesto estimado
        </label>
        <select id="budget" name="budget" defaultValue="" className={field}>
          <option value="">Prefiero conversarlo</option>
          <option value="hasta-3k">Hasta USD 3.000</option>
          <option value="3k-8k">USD 3.000 a 8.000</option>
          <option value="8k-20k">USD 8.000 a 20.000</option>
          <option value="mas-20k">Más de USD 20.000</option>
        </select>
        <p className="text-xs text-paper-faint">
          Ayuda a proponerte algo realista desde la primera respuesta.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <label htmlFor="message" className="text-sm font-medium text-paper">
          Qué necesitás filmar
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.message)}
          className={cn(field, "resize-y", state.fieldErrors?.message && "border-flame")}
        />
        {state.fieldErrors?.message && (
          <p id="message-error" className="text-sm text-flame-warm">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {/* Trampa para formularios automáticos. Oculta para personas y lectores. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">No completar</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <input ref={cargado} type="hidden" name="cargado" />

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm text-flame-warm sm:col-span-2"
        >
          <WarningCircleIcon size={18} weight="fill" className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
