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
        className="hidden md:flex items-center gap-1 p-1 bg-[#10121a] rounded-xl border border-white/[0.08] shadow-xs w-fit"
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-zinc-800 text-white shadow-xs border border-white/[0.08]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-colors ${
                  isActive ? "text-emerald-400" : "text-zinc-400"
                }`}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 pt-1 pb-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))] flex items-center justify-around shadow-2xl"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? "text-emerald-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] tracking-normal font-medium mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
