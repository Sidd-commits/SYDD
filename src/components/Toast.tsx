"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-2xl border text-xs sm:text-sm animate-fade-in backdrop-blur-xl ${
            toast.type === "success"
              ? "bg-[#0e1017]/95 border-emerald-500/40 text-white shadow-emerald-500/10"
              : toast.type === "error"
              ? "bg-[#18080a]/95 border-rose-500/40 text-white shadow-rose-500/10"
              : "bg-[#0e1017]/95 border-white/10 text-white"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {toast.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            {toast.type === "info" && (
              <Info className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span className="truncate font-semibold">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
