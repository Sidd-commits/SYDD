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
          barColor: "bg-emerald-500",
          accentColor: "#10b981",
        };
      case "calories":
        return {
          icon: Flame,
          iconColor: "text-amber-400",
          iconBg: "bg-amber-500/10 border-amber-500/20",
          barColor: "bg-amber-500",
          accentColor: "#f59e0b",
        };
      case "water":
        return {
          icon: Droplet,
          iconColor: "text-sky-400",
          iconBg: "bg-sky-500/10 border-sky-500/20",
          barColor: "bg-sky-500",
          accentColor: "#0ea5e9",
        };
      case "workout":
        return {
          icon: Dumbbell,
          iconColor: "text-indigo-400",
          iconBg: "bg-indigo-500/10 border-indigo-500/20",
          barColor: "bg-indigo-500",
          accentColor: "#6366f1",
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden transition-all">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`p-1.5 rounded-lg border shrink-0 ${theme.iconBg} ${theme.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-semibold tracking-wide text-zinc-300 uppercase truncate" title={title}>
                {title}
              </h3>
              {type === "calories" && (
                <span className="text-[11px] text-zinc-400 block truncate">
                  Informational intake
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isGoalMet && (
              <span
                title="Daily goal reached"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap select-none leading-none"
              >
                <Check className="w-3 h-3 stroke-[2.5] shrink-0" />
                <span>Met</span>
              </span>
            )}
            <button
              onClick={onEdit}
              aria-label={`Edit ${title}`}
              className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] rounded-md transition-colors cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Metric Value */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              {hasData ? (
                <>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums">
                    {value.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-zinc-400">
                    {unit}
                  </span>
                </>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-zinc-500 font-mono">
                    —
                  </span>
                  <span className="text-xs text-zinc-400">
                    Not logged
                  </span>
                </div>
              )}
            </div>

            {target !== undefined && target > 0 && (
              <p className="text-xs text-zinc-400 mt-1">
                Target: <span className="text-zinc-300 font-mono font-medium">{target.toLocaleString()} {unit}</span>
              </p>
            )}
          </div>

          {target !== undefined && target > 0 && hasData && (
            <span className="text-xs font-mono font-semibold text-zinc-400 tabular-nums">
              {percentage}%
            </span>
          )}
        </div>

        {/* Crisp Linear Progress Bar */}
        {target !== undefined && target > 0 && (
          <div className="mt-3 h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${theme.barColor}`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={target}
            />
          </div>
        )}

        {subtitle && (
          <p className="mt-2 text-xs text-zinc-400">
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
              className="flex-1 min-h-[36px] py-1.5 px-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.08] hover:border-white/[0.15] text-zinc-200 hover:text-white rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
