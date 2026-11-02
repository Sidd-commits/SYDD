"use client";

import React from "react";
import { ProposedAction, ProposedNutritionData, ProposedWaterData, ProposedStepsData, ProposedWorkoutData } from "@/types";
import { Utensils, Droplet, Footprints, Dumbbell, Check, X, Sparkles } from "lucide-react";

type ActionConfirmationCardProps = {
  action: ProposedAction;
  onConfirm: (action: ProposedAction) => void;
  onDismiss: (actionId: string) => void;
};

export function ActionConfirmationCard({
  action,
  onConfirm,
  onDismiss,
}: ActionConfirmationCardProps) {
  const isPending = action.status === "pending";
  const isConfirmed = action.status === "confirmed";
  const isDismissed = action.status === "dismissed";

  return (
    <div className={`mt-3 rounded-xl border transition-all p-3.5 ${
      isConfirmed
        ? "bg-emerald-950/20 border-emerald-500/30"
        : isDismissed
        ? "bg-zinc-900/40 border-white/[0.05] opacity-60"
        : "bg-[#12141c] border-emerald-500/30 shadow-lg shadow-black/40"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {action.type === "add_nutrition" && <Utensils className="w-3.5 h-3.5" />}
            {action.type === "log_water" && <Droplet className="w-3.5 h-3.5" />}
            {action.type === "log_steps" && <Footprints className="w-3.5 h-3.5" />}
            {action.type === "add_workout" && <Dumbbell className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-bold text-zinc-200 tracking-tight">
            {action.title}
          </span>
        </div>

        {isPending && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            <Sparkles className="w-2.5 h-2.5" /> Action Proposed
          </span>
        )}

        {isConfirmed && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
            <Check className="w-3 h-3 stroke-[2.5]" /> Saved to SYDD
          </span>
        )}

        {isDismissed && (
          <span className="text-[10px] font-medium text-zinc-500">
            Dismissed
          </span>
        )}
      </div>

      {/* Payload Details */}
      {action.type === "add_nutrition" && (
        <NutritionProposalDetails data={action.data as ProposedNutritionData} />
      )}

      {action.type === "log_water" && (
        <WaterProposalDetails data={action.data as ProposedWaterData} />
      )}

      {action.type === "log_steps" && (
        <StepsProposalDetails data={action.data as ProposedStepsData} />
      )}

      {action.type === "add_workout" && (
        <WorkoutProposalDetails data={action.data as ProposedWorkoutData} />
      )}

      {/* Action Controls */}
      {isPending && (
        <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
          <button
            onClick={() => onDismiss(action.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Dismiss
          </button>

          <button
            onClick={() => onConfirm(action)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Confirm & Save
          </button>
        </div>
      )}
    </div>
  );
}

function NutritionProposalDetails({ data }: { data: ProposedNutritionData }) {
  return (
    <div className="space-y-1.5 text-xs text-zinc-300">
      <div className="font-semibold text-white flex items-center justify-between">
        <span>{data.name}</span>
        {data.isEstimate && (
          <span className="text-[10px] text-zinc-400 font-normal">Approx. estimate</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5 py-1.5 px-2 rounded-lg bg-black/40 border border-white/[0.04] text-center font-mono">
        <div>
          <span className="text-[10px] text-zinc-400 block font-sans">Calories</span>
          <span className="font-bold text-amber-300 text-xs">{data.calories}</span>
          <span className="text-[9px] text-zinc-400 font-sans ml-0.5">kcal</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 block font-sans">Protein</span>
          <span className="font-bold text-emerald-400 text-xs">{data.proteinG ?? 0}</span>
          <span className="text-[9px] text-zinc-400 font-sans ml-0.5">g</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 block font-sans">Carbs</span>
          <span className="font-bold text-blue-400 text-xs">{data.carbsG ?? 0}</span>
          <span className="text-[9px] text-zinc-400 font-sans ml-0.5">g</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 block font-sans">Fat</span>
          <span className="font-bold text-purple-400 text-xs">{data.fatG ?? 0}</span>
          <span className="text-[9px] text-zinc-400 font-sans ml-0.5">g</span>
        </div>
      </div>
    </div>
  );
}

function WaterProposalDetails({ data }: { data: ProposedWaterData }) {
  return (
    <div className="text-xs text-zinc-300 flex items-center justify-between">
      <span>Hydration logging:</span>
      <span className="font-mono font-bold text-cyan-400">+{data.amountMl} ml</span>
    </div>
  );
}

function StepsProposalDetails({ data }: { data: ProposedStepsData }) {
  return (
    <div className="text-xs text-zinc-300 flex items-center justify-between">
      <span>Daily steps:</span>
      <span className="font-mono font-bold text-emerald-400">{data.steps.toLocaleString()} steps</span>
    </div>
  );
}

function WorkoutProposalDetails({ data }: { data: ProposedWorkoutData }) {
  return (
    <div className="text-xs text-zinc-300 flex items-center justify-between">
      <span className="capitalize">{data.type} workout:</span>
      <span className="font-mono font-bold text-amber-400">{data.durationMinutes} mins</span>
    </div>
  );
}

