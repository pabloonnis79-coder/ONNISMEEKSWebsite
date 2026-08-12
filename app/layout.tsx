import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DemoNotice } from "@/components/layout/demo-notice";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { GuideLines } from "@/components/layout/guide-lines";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { site } from "@/lib/site";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  publisher: site.legalName,
  alternates: {
    canonical: "/",
    languages: { "es-AR": "/" },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: `${site.name}, ${site.tagline}`,
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/api/og"] },
  /**
   * Dos artes distintos, a propósito.
   *
   * En la pestaña el ícono se dibuja a 16 px, y ahí el logo completo con
   * "ONNIS & MEEKS" en dos líneas no se lee: queda una mancha. Por eso los
   * tamaños chicos llevan solo el ampersand con su corchete, recortado del
   * propio logo. El logo entero se sigue usando donde se ve grande: el ícono
   * de iOS y el del manifiesto.
   *
   * Justamente por eso acá no se declaran los archivos de 192 y 512: si
   * estuvieran, el navegador podría elegirlos en una pantalla densa y volver
   * a mostrar la mancha.
   *
   * Tampoco hay favicon.svg. El que venía era un PNG de 1000 px envuelto en
   * una etiqueta SVG: 805 kB para dibujar 16 px, sin ninguna ventaja de vector.
   */
  icons: {
    icon: [{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${archivo.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-[100dvh] flex-col bg-ink text-paper">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-flame focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Saltar al contenido
        </a>

        <GuideLines />
        <div className="grain" aria-hidden="true" />
        <ScrollProgress />
        <SiteHeader />

        <main id="contenido" className="flex-1">
          {children}
        </main>

        <SiteFooter />
        <DemoNotice />
        <WhatsappButton />
        <CustomCursor />

        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
