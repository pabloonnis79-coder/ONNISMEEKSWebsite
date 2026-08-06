import { Hero } from "@/components/home/hero";
import { ClientWall } from "@/components/home/client-wall";
import { FeaturedWork } from "@/components/home/featured-work";
import { Manifesto } from "@/components/home/manifesto";
import { ServicesIndex } from "@/components/home/services-index";
import { Process } from "@/components/home/process";
import { ContactCta } from "@/components/home/contact-cta";
import { getClients, getFeaturedProjects } from "@/lib/db/projects";
import { site } from "@/lib/site";
import { youtubeThumb } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  // El muro del hero necesita mas material que la grilla de destacados: con
  // pocas portadas se repite la misma imagen en columnas contiguas.
  const [todos, clients] = await Promise.all([
    getFeaturedProjects(14),
    getClients(),
  ]);

  const projects = todos.slice(0, 5);
  const lead = projects[0];
  const poster =
    site.showreel.poster ||
    lead?.coverUrl ||
    (lead?.youtubeId ? youtubeThumb(lead.youtubeId) : null);

  return (
    <>
      <Hero
        poster={poster}
        showreelId={site.showreel.youtubeId}
        loopMp4={site.showreel.loopMp4}
        projects={todos}
      />
      <ClientWall clients={clients.slice(0, 10)} />
      <FeaturedWork projects={projects} />
      <Manifesto />
      <ServicesIndex projects={todos} />
      <Process />
      <ContactCta />
    </>
  );
}
