"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { WifiOff, Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

// Global state for install prompt so SettingsView or other views can access it
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<() => void>();

export function promptPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) return Promise.resolve(false);

  return deferredPrompt.prompt().then(() => {
    return deferredPrompt!.userChoice.then((choiceResult) => {
      deferredPrompt = null;
      installListeners.forEach((fn) => fn());
      return choiceResult.outcome === "accepted";
    });
  });
}

function subscribeInstall(callback: () => void) {
  installListeners.add(callback);
  return () => {
    installListeners.delete(callback);
  };
}

function getInstallSnapshot(): boolean {
  return !!deferredPrompt;
}

function getInstallServerSnapshot(): boolean {
  return false;
}

export function usePWAInstall(): boolean {
  return useSyncExternalStore(subscribeInstall, getInstallSnapshot, getInstallServerSnapshot);
}

// Network online/offline store
function subscribeOnline(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getOnlineServerSnapshot(): boolean {
  return true;
}

export function ServiceWorkerRegister() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);
  const canInstall = usePWAInstall();
  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Register service worker on HTTPS or localhost
    const isLocalhost = Boolean(
      window.location.hostname === "localhost" ||
        window.location.hostname === "[::1]" ||
        window.location.hostname.match(
          /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

    if ("serviceWorker" in navigator) {
      if (isLocalhost && process.env.NODE_ENV === "development") {
        // In local development, purge stale caches and unregister dev workers to prevent stale asset traps
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else if (window.location.protocol === "https:" || isLocalhost) {
        const handleLoad = () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;
                if (!newWorker) return;
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("[SYDD] New version available. Refresh to update.");
                  }
                });
              });
            })
            .catch((error) => {
              console.warn("[SYDD] Service worker registration notice:", error);
            });
        };

        if (document.readyState === "complete") {
          handleLoad();
        } else {
          window.addEventListener("load", handleLoad);
        }
      }
    }

    // 2. PWA beforeinstallprompt capture (Android Chrome, Edge, etc.)
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPrompt = e;
      installListeners.forEach((fn) => fn());
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      installListeners.forEach((fn) => fn());
      console.log("[SYDD] App installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await promptPWAInstall();
    }
  };

  return (
    <>
      {/* Offline Status Pill */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900/95 border border-amber-500/40 text-amber-300 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md animate-fade-in"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Offline mode active. All daily logs save locally to device.</span>
        </div>
      )}

      {/* Subtle Mobile Install Prompt Banner (Only when browser triggers beforeinstallprompt) */}
      {canInstall && !dismissInstallBanner && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-40 bg-zinc-900/95 border border-emerald-500/30 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl animate-fade-in flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white tracking-tight truncate">
                Install SYDD App
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                Fast home-screen access & offline support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              Install
            </button>
            <button
              onClick={() => setDismissInstallBanner(true)}
              aria-label="Dismiss install banner"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
