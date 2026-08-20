import type { NextConfig } from "next";

/**
 * A donde va mail.onnismeeks.com. accounts.zoho.com es la pantalla de la
 * cuenta; si algun dia se prefiere caer directo en la bandeja, cambiar por
 * https://mail.zoho.com y listo.
 */
const WEBMAIL = "https://accounts.zoho.com/";

const nextConfig: NextConfig = {
  images: {
    /**
     * Las imagenes se sirven como estan, sin pasar por el optimizador.
     *
     * El plan gratuito de Vercel da una cantidad limitada de imagenes
     * optimizadas por mes y el sitio la agoto: cada foto nueva contestaba
     * "Payment required" y se veia el circulo vacio, mientras las viejas
     * seguian andando porque ya estaban hechas. Un panel donde subir una foto
     * a veces funciona y a veces no es peor que uno que sirve la foto tal cual.
     *
     * Se paga en peso: nadie recorta ni convierte a webp. Lo que corresponde
     * es achicar al subir, del lado del panel, no depender de un servicio con
     * cuota.
     */
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    /**
     * Las miniaturas de YouTube topean en 1280x720. Sin este limite, Next
     * pedia variantes de 2560 y 3840 px que solo agrandan pixeles: mas peso y
     * peor nitidez. 1920 alcanza para cualquier pantalla y no infla nada.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      // Google Drive: los enlaces del boton Compartir se reescriben al CDN,
      // que es el unico que devuelve el archivo y no una pagina del visor.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "motion"],
  },
  /**
   * mail.onnismeeks.com no es una seccion del sitio: es un atajo para entrar
   * al correo. Cualquier ruta bajo ese subdominio sale para Zoho.
   *
   * Es una redireccion temporal a proposito. Una permanente queda cacheada en
   * el navegador de por vida, y si manana el correo se muda a otro proveedor
   * hay gente que seguiria yendo a Zoho sin manera de arreglarlo.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mail.onnismeeks.com" }],
        destination: WEBMAIL,
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
