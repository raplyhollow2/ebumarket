import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { PWA_BOOT_SCRIPT } from "@/lib/pwa-install";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Zyra — Clothes that get a second life",
  description:
    "Teen marketplace and free donation hub with Verified by Zyra listings.",
  applicationName: "Zyra",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zyra",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1c3024" },
    { media: "(prefers-color-scheme: dark)", color: "#1c3024" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Capture beforeinstallprompt before React hydrates (Chrome fires once). */}
        <script dangerouslySetInnerHTML={{ __html: PWA_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_#f3efe6_0%,_#ebe4d6_45%,_#e2ddd2_100%)] font-sans text-foreground antialiased">
        {children}
        <Toaster richColors position="top-center" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
