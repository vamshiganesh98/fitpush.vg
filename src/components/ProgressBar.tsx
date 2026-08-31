interface Props {
  label: string;
  current: number;
  target: number;
  unit: string;
  color?: string;
}

export default function ProgressBar({ label, current, target, unit, color = "bg-emerald-500" }: Props) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const over = current > target;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className={`font-semibold ${over && label === "Calories" ? "text-amber-400" : "text-white"}`}>
          {Math.round(current)}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over && label === "Calories" ? "bg-amber-500" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
