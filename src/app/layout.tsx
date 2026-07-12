import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobilePlanButton } from "@/components/layout/mobile-plan-button";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreHydrator } from "@/components/layout/store-hydrator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    description:
      "A mobile-first Durga Puja discovery and route planning app for Kolkata pandal hopping.",
    locale: "en_IN",
    siteName: "PujoPath Kolkata",
    title: "PujoPath Kolkata",
    type: "website",
  },
  title: {
    default: "PujoPath Kolkata",
    template: "%s | PujoPath Kolkata",
  },
  description:
    "A mobile-first Durga Puja discovery and route planning app for Kolkata pandal hopping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <StoreHydrator />
        <SiteHeader />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <MobilePlanButton />
        <BottomNav />
      </body>
    </html>
  );
}
