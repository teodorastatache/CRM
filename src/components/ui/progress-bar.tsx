export function ProgressBar({
  value,
  max,
  colorVar = "--pink-500",
  trackColorVar = "--pink-50",
}: {
  value: number;
  max: number;
  colorVar?: string;
  trackColorVar?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: `var(${trackColorVar})` }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: `var(${colorVar})` }}
      />
    </div>
  );
}
