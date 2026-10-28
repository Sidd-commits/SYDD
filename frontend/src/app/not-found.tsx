import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] shadow-2xl space-y-5 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Compass className="w-6 h-6" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            404 — Not Found
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Page Not Found
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            The page or view you requested does not exist or has moved. Return to your fitness dashboard to continue stacking days.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
