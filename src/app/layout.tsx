import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_#f3efe6_0%,_#ebe4d6_45%,_#e2ddd2_100%)] font-sans text-foreground antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
