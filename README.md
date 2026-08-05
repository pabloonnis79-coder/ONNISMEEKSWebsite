# ONNIS & MEEKS

Sitio del estudio. El canal de YouTube es el gestor de contenidos: se publica un
video con la descripción en el formato de abajo y el sitio crea la ficha del
proyecto, la enriquece con IA y actualiza portada, listado, buscador y SEO.

Stack: Next.js 16 (App Router, RSC), TypeScript, Tailwind v4, Motion, Supabase
(Postgres, Auth, Storage), Groq para la IA, Vercel para hosting y cron.

---

## 1. Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sin variables de entorno el sitio arranca igual, en **modo demo**, con proyectos
de muestra y un aviso visible al pie. Sirve para revisar el diseño antes de
conectar los servicios.

## 2. Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan gratuito).
2. SQL Editor, pegar y ejecutar `supabase/schema.sql`. Crea las tablas, los
   índices, la búsqueda full text en español, las políticas RLS y el bucket
   `media`.
3. Project Settings, API: copiar `URL`, `anon key` y `service_role key` al
   `.env.local`.
4. Authentication, Users: crear el usuario del estudio con correo y contraseña.
   Ese es el acceso al panel. Conviene desactivar el alta pública en
   Authentication, Providers, Email.

## 3. YouTube

1. Google Cloud Console, habilitar **YouTube Data API v3**.
2. Credenciales, crear una API key y restringirla a esa API.
3. Cargar `YOUTUBE_API_KEY` y `YOUTUBE_CHANNEL_HANDLE` (o `YOUTUBE_CHANNEL_ID`).

La cuota gratuita es de 10.000 unidades por día. Una sincronización completa de
200 videos consume alrededor de 15 unidades, así que dos corridas diarias no
llegan ni al 1 %.

## 4. Groq

API key gratuita en [console.groq.com/keys](https://console.groq.com/keys).
Sin la key el sitio no se rompe: arma los textos SEO con una lógica
determinística a partir de los campos de la descripción.

## 5. Formato de la descripción del video

Todo lo que va en la ficha del proyecto sale de acá. Las claves no distinguen
mayúsculas ni acentos, y los bloques pueden ocupar varias líneas.

```
CLIENTE: Nike
PROYECTO: Air Max 2027
AÑO: 2027
FECHA: 15/08/2027

SERVICIOS:
Producción audiovisual
Dirección
Color
Drone
Edición

CATEGORÍA: Publicidad
UBICACIÓN: Buenos Aires

DESCRIPCIÓN:
Texto completo contando la historia del proyecto.
Puede ocupar varios párrafos.

RESULTADOS:
Qué logró la pieza.

CREDITOS:
Dirección: Ana Ferreyra
Fotografía: Luis Ocampo

GALERIA:
https://.../foto-1.jpg
https://.../foto-2.jpg

MAKINGOF:
Detrás de cámara | https://youtu.be/XXXXXXXXXXX

TAGS: Publicidad, Nike, Sport
PORTADA: https://.../portada.jpg
DESTACADO: SI
ORDEN: 1
```

Claves reconocidas, con sus alias: `CLIENTE`/`CLIENT`/`MARCA`,
`PROYECTO`/`TITULO`, `AÑO`/`ANIO`/`YEAR`, `FECHA`, `SERVICIOS`,
`CATEGORÍA`/`RUBRO`, `UBICACIÓN`/`LOCACION`, `DESCRIPCIÓN`/`HISTORIA`,
`RESULTADOS`, `TAGS`/`ETIQUETAS`, `PORTADA`, `DESTACADO`, `ORDEN`,
`CREDITOS`/`EQUIPO`, `GALERIA`, `MAKINGOF`/`BTS`.

Si un video no trae ninguna clave, igual se importa: el título del video pasa a
ser el nombre del proyecto y la descripción completa pasa a ser la historia.

## 6. Sincronización

Tres caminos, todos van al mismo motor:

- **Cron de Vercel.** `vercel.json` corre `/api/sync` a las 06:00 y 18:00 UTC.
  Requiere `CRON_SECRET` cargada en Vercel.
- **Webhook de YouTube (PubSubHubbub).** Avisa en el momento en que se publica o
  edita un video. Suscribirse una vez en
  [pubsubhubbub.appspot.com](https://pubsubhubbub.appspot.com/subscribe):
  - Callback: `https://TU-DOMINIO/api/youtube/webhook`
  - Topic: `https://www.youtube.com/xml/feeds/videos.xml?channel_id=UCxxxx`
  - La suscripción vence cada 5 días, hay que renovarla.
- **Botón del panel.** `Sincronizar YouTube`, para forzarla a mano.

Parámetros útiles: `/api/sync?force=1` regenera los textos de IA aunque la
descripción no haya cambiado, y `/api/sync?video=ID1,ID2` procesa solo esos.

## 7. Panel

`/admin`, protegido por `proxy.ts`. Permite destacar, ocultar, reordenar,
cambiar entre borrador y publicado, editar cualquier campo, subir imágenes de
galería al bucket `media`, crear proyectos que no vienen de YouTube y eliminar.

**Los campos editados a mano quedan bloqueados.** Se guardan en
`locked_fields` y la sincronización deja de pisarlos, así una corrección no se
pierde en la próxima corrida.

## 8. Despliegue

```bash
npm run build
```

En Vercel: importar el repo, cargar todas las variables de `.env.example` y
listo. `NEXT_PUBLIC_SITE_URL` tiene que apuntar al dominio final, porque de ahí
salen las URL canónicas, el sitemap y las tarjetas para redes.

## 9. Qué falta cargar

- Correo real, redes y año de fundación en `lib/site.ts`. El WhatsApp ya está
  cargado con el número del estudio.
- `NEXT_PUBLIC_SHOWREEL_YOUTUBE_ID` con el showreel, y opcionalmente
  `NEXT_PUBLIC_SHOWREEL_MP4` con un loop corto y liviano para el fondo del hero.
- Fotos reales de rodaje donde hoy hay marcadores `picsum.photos`: `/estudio` y
  las miniaturas de la sección de servicios en la portada.
- Logos de clientes, desde el campo `logo_url` de la tabla `clients` o con el
  slug de [Simple Icons](https://simpleicons.org) en `logo_slug`. Sin archivo,
  la marca se resuelve tipográficamente.
- Premios, equipo y notas en `lib/content.ts`. Las páginas ya están armadas y se
  adaptan solas a la cantidad de items.

## 10. Estructura

```
app/
  page.tsx                    portada
  proyectos/                  listado con buscador y ficha por proyecto
  clientes/                   listado y ficha por cliente
  servicios/  estudio/  premios/  detras-de-camara/  notas/  contacto/
  admin/                      panel
  api/sync/                   sincronización
  api/youtube/webhook/        aviso instantáneo de YouTube
  api/og/                     tarjetas para redes, generadas al vuelo
lib/
  youtube/parser.ts           lee la descripción y la vuelve datos
  youtube/api.ts              cliente de YouTube Data API v3
  youtube/sync.ts             motor de sincronización
  ai/enrich.ts                textos SEO y de redes con Groq
  db/projects.ts              consultas, con respaldo en modo demo
  seo.ts                      metadata y datos estructurados
  site.ts                     marca, rutas, servicios, contacto
supabase/schema.sql           base de datos completa
```
