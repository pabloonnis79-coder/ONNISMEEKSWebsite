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

  const loop = [...clients, ...clients];

  return (
    <section aria-label="Marcas con las que trabajamos" className="border-y border-line py-8 md:py-10">
      <div className="edge-fade-x overflow-hidden">
        <div
          className="marquee-track flex w-max items-center gap-14 md:gap-20"
          style={{ ["--marquee-duration" as string]: `${Math.max(28, clients.length * 7)}s` }}
        >
          {loop.map((client, i) => (
            <div key={`${client.id}-${i}`} aria-hidden={i >= clients.length}>
              <Logo client={client} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
