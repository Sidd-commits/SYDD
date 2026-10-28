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
        className="hidden md:flex items-center gap-1.5 p-1.5 bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-inner w-fit"
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
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-zinc-800 text-white shadow-sm border border-emerald-500/30 text-emerald-300"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-emerald-400" : "text-zinc-500"
                }`}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex items-center justify-around shadow-2xl"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] py-1 px-2.5 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? "text-emerald-400 font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 scale-105 shadow-xs shadow-emerald-500/20"
                    : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-medium mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
