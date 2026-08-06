import Image from "next/image";
import type { Client } from "@/lib/types";

function Logo({ client }: { client: Client }) {
  if (client.logoUrl) {
    return (
      <Image
        src={client.logoUrl}
        alt={client.name}
        width={160}
        height={44}
        className="h-7 w-auto object-contain opacity-60 transition-opacity duration-300 hover:opacity-100 md:h-8"
      />
    );
  }

  if (client.logoSlug) {
    return (
      <Image
        src={`https://cdn.simpleicons.org/${client.logoSlug}/f4f3f0`}
        alt={client.name}
        width={40}
        height={40}
        className="h-7 w-auto opacity-60 transition-opacity duration-300 hover:opacity-100 md:h-8"
      />
    );
  }

  // Sin archivo de logo cargado, la marca se compone tipograficamente.
  return (
    <span className="whitespace-nowrap font-display text-lg font-extrabold uppercase tracking-[-0.02em] text-paper/55 transition-colors duration-300 hover:text-paper md:text-xl">
      {client.name}
    </span>
  );
}

export function ClientWall({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;

  return (
    // Fila estatica a proposito. La unica marquesina de la portada es la de
    // servicios: dos compitiendo entre si hacen que no se lea ninguna.
    <section
      aria-label="Marcas con las que trabajamos"
      className="border-y border-line py-10 md:py-14"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-12 gap-y-6 px-5 md:gap-x-20 md:px-10">
        {clients.map((client) => (
          <Logo key={client.id} client={client} />
        ))}
      </div>
    </section>
  );
}
