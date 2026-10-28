"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SYDD Runtime Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] shadow-2xl space-y-5 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            An unexpected error occurred while rendering the interface. Your logged fitness data in local storage remains safe.
          </p>
          {error.message && (
            <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/[0.06] text-left">
              <span className="text-[11px] font-mono text-zinc-400 break-words block">
                {error.message}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
