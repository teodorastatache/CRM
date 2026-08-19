export type StatusTone = "success" | "warning" | "critical" | "neutral" | "info";

const toneStyles: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-[var(--beige-100)] text-[var(--muted)] border-[var(--border)]",
  info: "bg-[var(--pink-50)] text-[var(--pink-600)] border-[var(--pink-100)]",
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneStyles[tone]}`}
    >
      {label}
    </span>
  );
}
