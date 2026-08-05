import { isDemoMode } from "@/lib/db/projects";

/**
 * Aviso visible mientras el sitio corre con contenido de muestra. Desaparece
 * solo, en cuanto existen las variables de Supabase.
 */
export function DemoNotice() {
  if (!isDemoMode()) return null;

  return (
    <div className="border-t border-flame/40 bg-flame/10 px-5 py-2.5 text-center md:px-10">
      <p className="text-[12px] leading-relaxed text-flame-warm">
        Contenido de muestra. Conectá Supabase y el canal de YouTube para ver los
        proyectos reales. Los clientes que aparecen son ficticios.
      </p>
    </div>
  );
}
