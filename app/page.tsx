import { Hero } from "@/components/home/hero";
import { ServicesMarquee } from "@/components/home/services-marquee";
import { ServicePanels } from "@/components/home/service-panels";
import { ClientWall } from "@/components/home/client-wall";
import { FeaturedWork } from "@/components/home/featured-work";
import { Manifesto } from "@/components/home/manifesto";
import { Process } from "@/components/home/process";
import { ContactCta } from "@/components/home/contact-cta";
import { getClients, getFeaturedProjects } from "@/lib/db/projects";
import { Authorities } from "@/components/home/authorities";
import { BrandCarousel } from "@/components/home/brand-carousel";
import {
  getAuthorities,
  getBrandLogos,
  getPhotoGalleries,
  getSectionVideos,
} from "@/lib/db/settings";
import { site } from "@/lib/site";
import { youtubeThumb } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [todos, clients, sectionVideos, autoridades, marcas, galerias] =
    await Promise.all([
      getFeaturedProjects(14),
      getClients(),
      getSectionVideos(),
      getAuthorities(),
      getBrandLogos(),
      getPhotoGalleries(),
    ]);

  const projects = todos.slice(0, 5);
  const lead = todos.find((p) => p.youtubeId) ?? todos[0];

  const poster =
    site.showreel.poster ||
    lead?.coverUrl ||
    (lead?.youtubeId ? youtubeThumb(lead.youtubeId) : null);

  return (
    <>
      <Hero
        poster={poster}
        showreelId={site.showreel.youtubeId || (sectionVideos.hero ?? "")}
        backdropId={sectionVideos.hero ?? lead?.youtubeId ?? null}
      />
      <ServicesMarquee />
      <ServicePanels
        projects={todos}
        sectionVideos={sectionVideos}
        galerias={galerias}
      />
      <FeaturedWork projects={projects} />
      <Manifesto />
      <Authorities people={autoridades} />
      {/* Si hay marcas cargadas a mano manda el carrusel; si no, se muestran
          los clientes que salieron solos de las descripciones de YouTube. */}
      {marcas.length > 0 ? (
        <BrandCarousel marcas={marcas} />
      ) : (
        <ClientWall clients={clients.slice(0, 10)} />
      )}
      <Process />
      <ContactCta />
    </>
  );
}
