"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { ActiveTab } from "@/types";
import { LayoutDashboard, CalendarDays, CheckSquare, Settings } from "lucide-react";

type NavItem = {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "history", label: "History", icon: CalendarDays },
  { id: "habits", label: "Habits", icon: CheckSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:flex items-center gap-1 p-1 bg-stone-100/90 dark:bg-stone-800/90 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 w-fit"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              role="tab"
              aria-selected={isActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm border border-stone-200/60 dark:border-stone-700/60"
                  : "text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-700/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-stone-600 dark:text-stone-300"
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-2 py-1 flex items-center justify-around safe-area-bottom shadow-lg"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? "bg-emerald-50 dark:bg-emerald-950/60 scale-105" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium tracking-tight mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
