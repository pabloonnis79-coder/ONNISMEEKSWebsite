"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (authError) {
      setError("No pudimos entrar con esos datos. Revisá el correo y la contraseña.");
      setPending(false);
      return;
    }

    router.replace(params.get("next") || "/admin");
    router.refresh();
  }

  const field =
    "w-full border border-line bg-ink-800 px-4 py-3 text-base text-paper placeholder:text-paper-dim focus:border-flame focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-paper">
          Correo
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={field} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-paper">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={field}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-flame-warm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-full flame-bg px-8 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
      >
        {pending ? "Entrando" : "Entrar"}
      </button>
    </form>
  );
}
