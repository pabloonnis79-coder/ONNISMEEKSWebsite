import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
