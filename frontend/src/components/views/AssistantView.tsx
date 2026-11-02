"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { ChatMessage, ProposedAction, ProposedNutritionData, ProposedWaterData, ProposedStepsData, ProposedWorkoutData } from "@/types";
import { AssistantService } from "@/lib/assistantService";
import { ActionConfirmationCard } from "../ActionConfirmationCard";
import { Sparkles, Send, Trash2, Bot, User, RefreshCw, Zap } from "lucide-react";

const SUGGESTIONS = [
  "3 eggs, 2 rotis and a banana",
  "How many calories have I consumed today?",
  "How much protein do I still need today?",
  "What are my macros so far?",
  "How consistent was I this week?",
  "Log 500ml water",
];

const STORAGE_CHAT_KEY = "sydd_assistant_messages_v1";

export function AssistantView() {
  const { appData, today, addNutritionEntry, logWater, logSteps, addWorkout, showToast } = useApp();
  const msgSeqRef = useRef(1);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_CHAT_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback to initial
      }
    }
    return [
      {
        id: "msg-welcome",
        role: "assistant",
        content:
          "👋 Hi! I'm your **SYDD AI Fitness Assistant**.\n\n" +
          "I can help you estimate calories and macros from everyday meals, track your daily targets, and check your workout consistency.\n\n" +
          "Try asking:\n" +
          "• *\"I ate 3 eggs, 2 rotis and a banana. What are the macros?\"*\n" +
          "• *\"How much protein do I still need today?\"*\n" +
          "• *\"What should I focus on to hit my goals?\"*",
        timestamp: "2026-01-01T00:00:00.000Z",
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providerInfo, setProviderInfo] = useState<string>("Initializing...");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch {
      // Ignore quota errors
    }
  }, [messages]);

  // Check provider status on mount
  useEffect(() => {
    AssistantService.getStatus().then((status) => {
      if (status) {
        setProviderInfo(status.activeProvider);
      } else {
        setProviderInfo("Local Heuristics");
      }
    });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput("");

    const seq = msgSeqRef.current++;
    const userMessage: ChatMessage = {
      id: `msg-user-${seq}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await AssistantService.sendMessage(newMessages, appData, today);

      const assistantMessage: ChatMessage = {
        id: `msg-asst-${msgSeqRef.current++}`,
        role: "assistant",
        content: response.reply,
        proposedAction: response.proposedAction || null,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error contacting assistant";
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${msgSeqRef.current++}`,
          role: "assistant",
          content: `⚠️ ${errorMsg}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = (action: ProposedAction) => {
    if (action.type === "add_nutrition") {
      const data = action.data as ProposedNutritionData;
      addNutritionEntry({
        name: data.name,
        calories: data.calories,
        proteinG: data.proteinG,
        carbsG: data.carbsG,
        fatG: data.fatG,
        date: data.date || today,
      });
    } else if (action.type === "log_water") {
      const data = action.data as ProposedWaterData;
      logWater(data.amountMl, data.mode, data.date || today);
    } else if (action.type === "log_steps") {
      const data = action.data as ProposedStepsData;
      logSteps(data.steps, data.date || today);
    } else if (action.type === "add_workout") {
      const data = action.data as ProposedWorkoutData;
      addWorkout(data.type, data.durationMinutes, data.notes, data.date || today);
    }

    // Update action status to confirmed in local state
    setMessages((prev) =>
      prev.map((msg) =>
        msg.proposedAction?.id === action.id
          ? {
              ...msg,
              proposedAction: { ...msg.proposedAction, status: "confirmed" },
            }
          : msg
      )
    );

    showToast(`✓ Confirmed and saved to ${action.title}!`);
  };

  const handleDismissAction = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.proposedAction?.id === actionId
          ? {
              ...msg,
              proposedAction: { ...msg.proposedAction, status: "dismissed" },
            }
          : msg
      )
    );
  };

  const handleClearHistory = () => {
    const welcome: ChatMessage = {
      id: "msg-welcome",
      role: "assistant",
      content: "Chat cleared. What can I help you with next?",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    try {
      localStorage.removeItem(STORAGE_CHAT_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-11rem)] max-w-4xl mx-auto bg-[#10121a] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-3 border-b border-white/[0.08] bg-[#0c0e14] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              SYDD AI Assistant
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hidden sm:inline-flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Ready
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Powered by <span className="text-zinc-300 font-medium">{providerInfo}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="Clear chat history"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
                msg.role === "user"
                  ? "bg-zinc-800 text-zinc-200 border border-white/[0.08]"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-2">
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-xs shadow-xs"
                    : "bg-[#161923] text-zinc-200 rounded-tl-xs border border-white/[0.06] shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{formatMarkdownText(msg.content)}</div>
              </div>

              {/* Action Proposal Card if present */}
              {msg.proposedAction && (
                <ActionConfirmationCard
                  action={msg.proposedAction}
                  onConfirm={handleConfirmAction}
                  onDismiss={handleDismissAction}
                />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[75%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#161923] border border-white/[0.06] flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse delay-150" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse delay-300" />
              <span className="text-xs text-zinc-400 ml-1">Analyzing nutrition & data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 bg-[#0c0e14] border-t border-white/[0.05] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Suggestions:
        </span>
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSend(sug)}
            className="text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-white/[0.07] px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#0c0e14] border-t border-white/[0.08] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything or describe a meal: '3 eggs, 2 rotis and a banana'..."
          className="flex-1 bg-[#12141c] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus:outline-hidden focus:border-emerald-500/50 placeholder:text-zinc-400 transition-all"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-semibold rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
          ) : (
            <>
              <span className="hidden sm:inline">Send</span>
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * Basic markdown parser for bold, bullets, and links in assistant messages.
 */
function formatMarkdownText(text: string) {
  const parts = text.split("\n");
  return parts.map((line, idx) => {
    // Bold replacement (**text**)
    const boldFormatted = line.split(/(\*\*[^*]+\*\*)/g).map((chunk, cIdx) => {
      if (chunk.startsWith("**") && chunk.endsWith("**")) {
        return (
          <strong key={cIdx} className="font-semibold text-white">
            {chunk.slice(2, -2)}
          </strong>
        );
      }
      return chunk;
    });

    return (
      <React.Fragment key={idx}>
        {boldFormatted}
        {idx < parts.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
