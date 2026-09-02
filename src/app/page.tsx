"use client";

import { useState } from "react";
import { AppProvider, useApp } from "@/lib/context";
import BottomNav, { Tab } from "@/components/BottomNav";
import Dashboard from "@/components/Dashboard";
import MealLogger from "@/components/MealLogger";
import WorkoutLogger from "@/components/WorkoutLogger";
import HistoryView from "@/components/HistoryView";
import ProfileView from "@/components/ProfileView";
import Onboarding from "@/components/Onboarding";

function AppShell() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>("home");

  if (!state.onboardingCompleted || !state.profile) {
    return <OnboardingGate />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto max-w-lg px-4 pt-6 pb-28">
        {tab === "home" && <Dashboard />}
        {tab === "meals" && <MealLogger />}
        {tab === "workout" && <WorkoutLogger />}
        {tab === "history" && <HistoryView />}
        {tab === "profile" && <ProfileView />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

function OnboardingGate() {
  const { state, completeOnboarding } = useApp();
  return <Onboarding onComplete={completeOnboarding} initial={state.profile} />;
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
