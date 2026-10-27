import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

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
  keywords: ["fitness tracker", "habit tracker", "consistency graph", "activity heatmap", "SYDD"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full dark ${jakarta.variable} ${mono.variable}`}>
      <body className="min-h-full flex flex-col bg-[#08090d] text-zinc-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
