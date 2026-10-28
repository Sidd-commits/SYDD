"use client";

import React from "react";
import { Check, Footprints, Flame, Droplet, Dumbbell, Plus, Edit3 } from "lucide-react";

type MetricCardProps = {
  title: string;
  type: "steps" | "calories" | "water" | "workout";
  value: number;
  target?: number;
  unit: string;
  isGoalMet?: boolean;
  hasData: boolean;
  subtitle?: string;
  onEdit: () => void;
  onQuickAdd?: (amount: number) => void;
  quickAddOptions?: { label: string; amount: number }[];
};

export function MetricCard({
  title,
  type,
  value,
  target,
  unit,
  isGoalMet = false,
  hasData,
  subtitle,
  onEdit,
  onQuickAdd,
  quickAddOptions,
}: MetricCardProps) {
  const percentage =
    target && target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;

  // Visual themes per metric type
  const getTheme = () => {
    switch (type) {
      case "steps":
        return {
          icon: Footprints,
          iconColor: "text-emerald-400",
          iconBg: "bg-emerald-500/10 border-emerald-500/20",
          glowBar: "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/40",
          badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          accentColor: "#10b981",
        };
      case "calories":
        return {
          icon: Flame,
          iconColor: "text-amber-400",
          iconBg: "bg-amber-500/10 border-amber-500/20",
          glowBar: "bg-gradient-to-r from-amber-500 to-orange-400 shadow-sm shadow-amber-500/40",
          badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          accentColor: "#f59e0b",
        };
      case "water":
        return {
          icon: Droplet,
          iconColor: "text-sky-400",
          iconBg: "bg-sky-500/10 border-sky-500/20",
          glowBar: "bg-gradient-to-r from-sky-500 to-cyan-400 shadow-sm shadow-sky-500/40",
          badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          accentColor: "#0ea5e9",
        };
      case "workout":
        return {
          icon: Dumbbell,
          iconColor: "text-indigo-400",
          iconBg: "bg-indigo-500/10 border-indigo-500/20",
          glowBar: "bg-gradient-to-r from-indigo-500 to-purple-400 shadow-sm shadow-indigo-500/40",
          badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          accentColor: "#6366f1",
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  // Circular gauge calculations
  const strokeWidth = 4;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card glass-card-interactive rounded-3xl p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity duration-300 group-hover:opacity-30"
        style={{ backgroundColor: theme.accentColor }}
      />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl border shrink-0 ${theme.iconBg} ${theme.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold tracking-wide text-zinc-300 uppercase font-mono truncate">
                {title}
              </h3>
              {type === "calories" && (
                <span className="text-[10px] text-zinc-500 font-medium block truncate">
                  Informational intake
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isGoalMet && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow-xs shrink-0 whitespace-nowrap">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Goal met</span>
              </span>
            )}
            <button
              onClick={onEdit}
              aria-label={`Edit ${title}`}
              className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Metric Value with Circular Mini Gauge */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              {hasData ? (
                <>
                  <span className="text-3xl font-black font-mono tracking-tight text-white tabular-nums">
                    {value.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    {unit}
                  </span>
                </>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-zinc-600 font-mono">
                    —
                  </span>
                  <span className="text-xs text-zinc-500 italic">
                    Not logged
                  </span>
                </div>
              )}
            </div>

            {target !== undefined && target > 0 && (
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                Target: <strong className="text-zinc-200 font-mono font-bold">{target.toLocaleString()} {unit}</strong>
              </p>
            )}
          </div>

          {/* Mini Circular Gauge (only if target > 0) */}
          {target !== undefined && target > 0 && hasData && (
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-white/[0.08]"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke={theme.accentColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                {percentage}%
              </div>
            </div>
          )}
        </div>

        {/* Shimmering Progress Bar */}
        {target !== undefined && target > 0 && (
          <div className="mt-3 h-2 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out shimmer-bar ${theme.glowBar}`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={target}
            />
          </div>
        )}

        {subtitle && (
          <p className="mt-2 text-xs text-zinc-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Quick Add Actions */}
      {quickAddOptions && quickAddOptions.length > 0 && onQuickAdd && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
          {quickAddOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => onQuickAdd(opt.amount)}
              className="flex-1 py-1.5 px-2 bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-300 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
