import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DemoNotice } from "@/components/layout/demo-notice";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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

        <div className="grain" aria-hidden="true" />
        <SiteHeader />

        <main id="contenido" className="flex-1">
          {children}
        </main>

        <SiteFooter />
        <DemoNotice />
        <WhatsappButton />

        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
