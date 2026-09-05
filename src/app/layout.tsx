import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/layout/providers";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Atelier Graded | Exceptional Graded Collectibles",
    template: "%s | Atelier Graded",
  },
  description: "A private showroom for graded collectibles.",
  keywords: ["graded cards", "collectibles", "trading cards", "premium cards"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${cormorant.variable} h-full dark antialiased`}>
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="sr-only fixed top-4 left-4 z-[100] rounded-md bg-gold px-4 py-2 text-sm font-bold text-primary-foreground focus:not-sr-only">
          Skip to content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main-content" className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
