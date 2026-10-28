import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SYDD — Show up. Stack days.",
  description:
    "A responsive, personal fitness consistency tracker inspired by GitHub's contribution graph. Track steps, hydration, workouts, and daily habits with privacy-first local storage.",
  applicationName: "SYDD",
  keywords: [
    "fitness tracker",
    "habit tracker",
    "consistency graph",
    "activity heatmap",
    "SYDD",
    "PWA",
  ],
  authors: [{ name: "SYDD Team" }],
  creator: "SYDD",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SYDD",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090d" },
    { media: "(prefers-color-scheme: light)", color: "#08090d" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full dark ${jakarta.variable} ${mono.variable}`}>
      <body className="min-h-full flex flex-col bg-[#08090d] text-zinc-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <AppProvider>
          {children}
          <ServiceWorkerRegister />
        </AppProvider>
      </body>
    </html>
  );
}
