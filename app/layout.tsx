import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AuthPrompt } from "@/components/auth/auth-prompt";
import { CursorGlow, ScrollProgress } from "@/components/ui/motion";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { OutsideAdmin } from "@/components/layout/outside-admin";
import { isAdminDemoMode } from "@/lib/admin/session";
import { SITE } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-face",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const appleSplashes = [
  { file: "640x1136", width: 320, height: 568, ratio: 2 },
  { file: "750x1334", width: 375, height: 667, ratio: 2 },
  { file: "828x1792", width: 414, height: 896, ratio: 2 },
  { file: "1125x2436", width: 375, height: 812, ratio: 3 },
  { file: "1170x2532", width: 390, height: 844, ratio: 3 },
  { file: "1242x2688", width: 414, height: 896, ratio: 3 },
  { file: "1284x2778", width: 428, height: 926, ratio: 3 },
  { file: "1290x2796", width: 430, height: 932, ratio: 3 },
  { file: "1320x2868", width: 440, height: 956, ratio: 3 },
  { file: "1488x2266", width: 744, height: 1133, ratio: 2 },
  { file: "1536x2048", width: 768, height: 1024, ratio: 2 },
  { file: "1620x2160", width: 810, height: 1080, ratio: 2 },
  { file: "1640x2360", width: 820, height: 1180, ratio: 2 },
  { file: "1668x2388", width: 834, height: 1194, ratio: 2 },
  { file: "2048x2732", width: 1024, height: 1366, ratio: 2 },
].map(({ file, width, height, ratio }) => ({
  url: `/splash/apple-splash-${file}.png`,
  media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
}));

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "UNTOUCH",
    "premium restaurant Karachi",
    "order food online Pakistan",
    "gourmet burgers",
    "wood fired pizza",
    "BBQ delivery",
  ],
  authors: [{ name: SITE.credits.team }],
  creator: SITE.credits.host,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    locale: "en_PK",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "black",
    startupImage: appleSplashes,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icons/icon-192.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh bg-ink font-sans text-cream antialiased">
        <Providers demo={isAdminDemoMode()}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-cream focus:px-5 focus:py-2 focus:text-sm focus:text-ink"
          >
            Skip to content
          </a>
          <OutsideAdmin>
            <ScrollProgress />
            <CursorGlow />
            <SiteHeader />
          </OutsideAdmin>
          <main id="main" className="relative z-[2]">
            {children}
          </main>
          <OutsideAdmin>
            <SiteFooter />
          </OutsideAdmin>
          <CartDrawer />
          <AuthPrompt />
          <CookieConsent />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
