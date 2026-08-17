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
import { OpeningCurtain } from "@/components/home/opening-curtain";
import {
  getAuthorities,
  getBrandLogos,
  getBrandScale,
  getPhotoGalleries,
  getReelsConDuracion,
  getSectionMp4,
  getSectionVideos,
} from "@/lib/db/settings";
import { getTextos } from "@/lib/db/textos";
import { site } from "@/lib/site";
import { youtubeThumb } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [todos, clients, sectionVideos, autoridades, marcas, galerias, reels, escalaMarcas, mp4Secciones, t] =
    await Promise.all([
      getFeaturedProjects(14),
      getClients(),
      getSectionVideos(),
      getAuthorities(),
      getBrandLogos(),
      getPhotoGalleries(),
      getReelsConDuracion(),
      getBrandScale(),
      getSectionMp4(),
      getTextos(),
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
      <OpeningCurtain />

      {/* El botón de sonido abre lo mismo que se ve de fondo: con dos ids
          distintos, apretar play cambiaba de video sin motivo. */}
      <Hero
        poster={poster}
        showreelId={heroId ?? ""}
        backdropId={heroId}
        mp4={mp4Secciones.hero ?? null}
        titulo1={t["home.hero.titulo1"]}
        titulo2={t["home.hero.titulo2"]}
        bajada={t["home.hero.bajada"]}
      />
      <ServicesMarquee />
      <ServicePanels
        projects={todos}
        sectionVideos={sectionVideos}
        mp4Secciones={mp4Secciones}
        galerias={galerias}
      />
      <FeaturedWork
        projects={projects}
        antetitulo={t["home.trabajos.antetitulo"]}
        titulo={t["home.trabajos.titulo"]}
        enlace={t["home.trabajos.enlace"]}
      />
      <Reels
        reels={reels}
        antetitulo={t["home.reels.antetitulo"]}
        titulo={t["home.reels.titulo"]}
      />
      <Manifesto
        titulo={t["home.manifiesto.titulo"]}
        resaltado={t["home.manifiesto.resaltado"]}
        texto={t["home.manifiesto.texto"]}
      />
      <Authorities people={autoridades} titulo={t["home.autoridades.titulo"]} />
      {/* Si hay marcas cargadas a mano manda el carrusel; si no, se muestran
          los clientes que salieron solos de las descripciones de YouTube. */}
      {marcas.length > 0 ? (
        <BrandCarousel
          marcas={marcas}
          escala={escalaMarcas}
          titulo={t["home.marcas.titulo"]}
        />
      ) : (
        <ClientWall clients={clients.slice(0, 10)} />
      )}
      <Process
        titulo={t["home.proceso.titulo"]}
        bajada={t["home.proceso.bajada"]}
        steps={[1, 2, 3].map((n) => ({
          verb: t[`home.proceso.paso${n}.titulo`],
          body: t[`home.proceso.paso${n}.texto`],
        }))}
      />
      <ContactCta
        titulo={t["home.contacto.titulo"]}
        enlace={t["home.contacto.enlace"]}
      />
    </>
  );
}
