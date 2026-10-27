"use client";

import React, { Suspense } from "react";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { ToastContainer } from "@/components/Toast";
import { QuickLogModal } from "@/components/QuickLogModal";
import { DayDetailModal } from "@/components/DayDetailModal";
import { OverviewView } from "@/components/views/OverviewView";
import { HistoryView } from "@/components/views/HistoryView";
import { HabitsView } from "@/components/views/HabitsView";
import { SettingsView } from "@/components/views/SettingsView";

function DashboardContent() {
  const { activeTab } = useApp();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Navigation />
      </div>

      {activeTab === "overview" && <OverviewView />}
      {activeTab === "history" && <HistoryView />}
      {activeTab === "habits" && <HabitsView />}
      {activeTab === "settings" && <SettingsView />}
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-stone-900 dark:bg-[#0c0a09] dark:text-stone-100">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-stone-400">Loading SYDD dashboard...</div>}>
          <DashboardContent />
        </Suspense>
      </main>

      <QuickLogModal />
      <DayDetailModal />
      <ToastContainer />
    </div>
  );
}
