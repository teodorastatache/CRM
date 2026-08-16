import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  suffix,
  sublabel,
  icon: Icon,
  tone = "pink",
}: {
  label: string;
  value: string;
  suffix?: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "pink" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ${
        isDark
          ? "bg-gradient-to-br from-[var(--pink-600)] to-[var(--pink-800)] text-white"
          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`text-xs font-bold uppercase tracking-wide ${
            isDark ? "text-white/80" : "text-[var(--muted)]"
          }`}
        >
          {label}
        </span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isDark ? "bg-white/15 text-white" : "bg-[var(--pink-100)] text-[var(--pink-600)]"
          }`}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="text-2xl font-extrabold">
        {value}
        {suffix && (
          <span className={`ml-1 text-sm font-semibold ${isDark ? "text-white/80" : "text-[var(--muted)]"}`}>
            {suffix}
          </span>
        )}
      </p>
      {sublabel && (
        <p className={`mt-1 text-xs ${isDark ? "text-white/75" : "text-[var(--muted)]"}`}>{sublabel}</p>
      )}
    </div>
  );
}
