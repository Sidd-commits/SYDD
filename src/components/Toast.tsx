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
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border text-sm animate-fade-in backdrop-blur-md ${
            toast.type === "success"
              ? "bg-white/95 dark:bg-stone-900/95 border-emerald-500/30 text-stone-900 dark:text-stone-100"
              : toast.type === "error"
              ? "bg-rose-50/95 dark:bg-rose-950/95 border-rose-500/30 text-rose-900 dark:text-rose-100"
              : "bg-white/95 dark:bg-stone-900/95 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            {toast.type === "info" && (
              <Info className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
            )}
            <span className="truncate font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
