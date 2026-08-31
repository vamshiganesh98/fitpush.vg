"use client";

import { useState } from "react";
import { AppProvider } from "@/lib/context";
import BottomNav, { Tab } from "@/components/BottomNav";
import Dashboard from "@/components/Dashboard";
import MealLogger from "@/components/MealLogger";
import WorkoutLogger from "@/components/WorkoutLogger";
import WeeklyCheckIn from "@/components/WeeklyCheckIn";
import ProfileView from "@/components/ProfileView";

function AppShell() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto max-w-lg px-4 pt-6 pb-28">
        {tab === "home" && <Dashboard />}
        {tab === "meals" && <MealLogger />}
        {tab === "workout" && <WorkoutLogger />}
        {tab === "weekly" && <WeeklyCheckIn />}
        {tab === "profile" && <ProfileView />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
