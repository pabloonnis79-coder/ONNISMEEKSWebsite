import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de solo lectura para las paginas publicas.
 *
 * No toca cookies a proposito. El sitio publico no necesita sesion: las
 * politicas RLS ya limitan al rol anonimo a lo publicado y no oculto. Ademas,
 * leer cookies obligaria a Next a renderizar todo de forma dinamica y romperia
 * `generateStaticParams`, que corre en compilacion sin peticion HTTP.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
