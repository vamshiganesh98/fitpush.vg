interface Props {
  message: string;
  tone?: "praise" | "warning" | "neutral";
  title?: string;
}

export default function CoachCard({ message, tone = "neutral", title = "Coach" }: Props) {
  const styles = {
    praise: "border-emerald-500/30 bg-emerald-500/10",
    warning: "border-red-500/30 bg-red-500/10",
    neutral: "border-zinc-700 bg-zinc-900",
  };

  const icons = { praise: "✅", warning: "⚠️", neutral: "💬" };

  return (
    <div className={`rounded-2xl border p-4 ${styles[tone]}`}>
      <div className="mb-2 flex items-center gap-2">
        <span>{icons[tone]}</span>
        <span className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-100">{message}</p>
    </div>
  );
}
