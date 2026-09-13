"use client";

type Tab = "home" | "meals" | "workout" | "coach" | "profile";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "meals", label: "Diet", icon: "🍽️" },
  { id: "workout", label: "Gym", icon: "💪" },
  { id: "coach", label: "AI", icon: "✨" },
  { id: "profile", label: "You", icon: "👤" },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg justify-around px-1 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] transition ${
              active === tab.id ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-500"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export type { Tab };
