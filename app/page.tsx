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
import { Reels } from "@/components/home/reels";
import {
  getAuthorities,
  getBrandLogos,
  getBrandScale,
  getPhotoGalleries,
  getReels,
  getSectionVideos,
} from "@/lib/db/settings";
import { site } from "@/lib/site";
import { youtubeThumb } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [todos, clients, sectionVideos, autoridades, marcas, galerias, reels, escalaMarcas] =
    await Promise.all([
      getFeaturedProjects(14),
      getClients(),
      getSectionVideos(),
      getAuthorities(),
      getBrandLogos(),
      getPhotoGalleries(),
      getReels(),
      getBrandScale(),
    ]);

  const projects = todos.slice(0, 5);
  const lead = todos.find((p) => p.youtubeId) ?? todos[0];

  /**
   * El video que corre de fondo en el hero, por orden de prioridad.
   *
   * Primero manda el panel. Es la única de las tres fuentes que el estudio
   * puede cambiar solo, así que tiene que ganar: si no, cambiar el video ahí
   * no haría nada y no habría manera de darse cuenta de por qué. Después el
   * showreel del despliegue, y al final el último trabajo publicado, para que
   * el hero nunca quede sin video.
   */
  const heroId = sectionVideos.hero || site.showreel.youtubeId || lead?.youtubeId || null;

  /**
   * La imagen de espera es el fotograma del mismo video que va a arrancar. Si
   * fuera la portada de otro proyecto, al empezar la reproducción se veria un
   * cambio de imagen que delata el truco.
   */
  const poster =
    site.showreel.poster ||
    (heroId ? youtubeThumb(heroId) : null) ||
    lead?.coverUrl ||
    null;

  return (
    <>
      {/* El botón de sonido abre lo mismo que se ve de fondo: con dos ids
          distintos, apretar play cambiaba de video sin motivo. */}
      <Hero
        poster={poster}
        showreelId={heroId ?? ""}
        backdropId={heroId}
      />
      <ServicesMarquee />
      <ServicePanels
        projects={todos}
        sectionVideos={sectionVideos}
        galerias={galerias}
      />
      <FeaturedWork projects={projects} />
      <Reels reels={reels} />
      <Manifesto />
      <Authorities people={autoridades} />
      {/* Si hay marcas cargadas a mano manda el carrusel; si no, se muestran
          los clientes que salieron solos de las descripciones de YouTube. */}
      {marcas.length > 0 ? (
        <BrandCarousel marcas={marcas} escala={escalaMarcas} />
      ) : (
        <ClientWall clients={clients.slice(0, 10)} />
      )}
      <Process />
      <ContactCta />
    </>
  );
}
