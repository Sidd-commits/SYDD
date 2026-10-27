import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fbfbf9] text-stone-900 dark:bg-[#0c0a09] dark:text-stone-100 selection:bg-emerald-200 dark:selection:bg-emerald-900">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
