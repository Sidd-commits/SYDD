"use client";

import React from "react";
import { Check, Footprints, Flame, Droplet, Dumbbell, Plus, Edit2 } from "lucide-react";

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

  const getIcon = () => {
    switch (type) {
      case "steps":
        return <Footprints className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "calories":
        return <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "water":
        return <Droplet className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case "workout":
        return <Dumbbell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const getProgressBarColor = () => {
    if (type === "calories") {
      return "bg-amber-500 dark:bg-amber-400";
    }
    if (isGoalMet) {
      return "bg-emerald-500 dark:bg-emerald-400";
    }
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-tight text-stone-500 dark:text-stone-400 uppercase">
                {title}
              </h3>
              {type === "calories" && (
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                  Informational intake
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isGoalMet && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3 h-3 stroke-[3]" />
                Goal met
              </span>
            )}
            <button
              onClick={onEdit}
              aria-label={`Edit ${title}`}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Metric Value */}
        <div className="mt-3 flex items-baseline gap-1.5">
          {hasData ? (
            <>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-stone-900 dark:text-stone-100">
                {value.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400">
                {unit}
              </span>
            </>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-stone-400 dark:text-stone-600">
                —
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500 italic">
                (not logged today)
              </span>
            </div>
          )}
        </div>

        {/* Target and remaining progress */}
        {target !== undefined && target > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>
              Target: <strong className="text-stone-700 dark:text-stone-300">{target.toLocaleString()} {unit}</strong>
            </span>
            {hasData && (
              <span className="tabular-nums font-semibold text-stone-600 dark:text-stone-300">
                {percentage}%
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {target !== undefined && target > 0 && (
          <div className="mt-2.5 h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${getProgressBarColor()}`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={target}
            />
          </div>
        )}

        {subtitle && (
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Quick Add Actions */}
      {quickAddOptions && quickAddOptions.length > 0 && onQuickAdd && (
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-2">
          {quickAddOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => onQuickAdd(opt.amount)}
              className="flex-1 py-1.5 px-2 bg-stone-50 hover:bg-emerald-50 dark:bg-stone-800/60 dark:hover:bg-emerald-950/40 border border-stone-200/80 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-800 text-stone-700 hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-300 rounded-xl text-xs font-semibold transition-all active:scale-98 flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
