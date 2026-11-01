"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Plus } from "lucide-react";

type RestTimerProps = {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
};

// Pure Web Audio API chime - zero external audio assets needed
function playTimerChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // Dual chime: 880Hz (A5) then 1174Hz (D6)
    playTone(880, now, 0.25);
    playTone(1174, now + 0.2, 0.4);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

export function RestTimer({ initialSeconds = 90, isOpen, onClose }: RestTimerProps) {
  if (!isOpen) return null;

  return (
    <RestTimerContent
      key={initialSeconds}
      initialSeconds={initialSeconds}
      onClose={onClose}
    />
  );
}

function RestTimerContent({
  initialSeconds,
  onClose,
}: {
  initialSeconds: number;
  onClose: () => void;
}) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          if (isSoundEnabled) {
            playTimerChime();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, isSoundEnabled]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPercent =
    totalSeconds > 0
      ? Math.max(0, Math.min(100, ((totalSeconds - secondsRemaining) / totalSeconds) * 100))
      : 100;
  const isFinished = secondsRemaining === 0;

  const setPreset = (secs: number) => {
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsActive(true);
  };

  const addTime = (secs: number) => {
    setTotalSeconds((prev) => prev + secs);
    setSecondsRemaining((prev) => prev + secs);
    setIsActive(true);
  };

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 right-4 z-40 bg-zinc-900/90 border border-emerald-500/40 text-white rounded-full px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2 cursor-pointer hover:scale-105 transition-all animate-fade-in"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-mono font-bold">{formattedTime}</span>
        <span className="text-[10px] text-zinc-400">Resting</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-72 bg-[#12141c]/95 border border-white/[0.12] rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden animate-slide-up-mobile">
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isFinished
                ? "bg-amber-400"
                : isActive
                ? "bg-emerald-400 animate-pulse"
                : "bg-zinc-500"
            }`}
          />
          <span className="text-xs font-semibold text-zinc-200">Rest Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
            title={isSoundEnabled ? "Sound enabled" : "Sound muted"}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 text-zinc-400 hover:text-white rounded transition-colors text-xs font-mono cursor-pointer"
            title="Minimize"
          >
            _
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="p-4 text-center">
        <div className="text-3xl font-black font-mono tracking-tight text-white tabular-nums">
          {formattedTime}
        </div>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {isFinished ? "Rest complete! Next set." : isActive ? "Resting between sets" : "Timer paused"}
        </p>

        {/* Linear Progress Bar */}
        <div className="mt-3 h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isFinished ? "bg-amber-400" : "bg-emerald-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xs"
            }`}
          >
            {isActive ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isActive ? "Pause" : "Resume"}</span>
          </button>

          <button
            type="button"
            onClick={() => setSecondsRemaining(totalSeconds)}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => addTime(30)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Add 30 seconds"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>30s</span>
          </button>
        </div>

        {/* Quick Presets Row */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-1">
          {[45, 60, 90, 120, 180].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPreset(s)}
              className={`flex-1 py-1 text-[11px] font-mono rounded-md border transition-all cursor-pointer ${
                totalSeconds === s && !isFinished
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
                  : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s < 60 ? `${s}s` : s % 60 === 0 ? `${s / 60}m` : `${Math.floor(s / 60)}m${s % 60}s`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
