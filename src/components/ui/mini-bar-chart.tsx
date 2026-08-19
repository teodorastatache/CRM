export function MiniBarChart({
  data,
  colorVar = "--pink-500",
  formatValue,
}: {
  data: { label: string; value: number }[];
  colorVar?: string;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className="w-full min-w-[4px] rounded-t-md transition-all"
            style={{
              height: `${Math.max(4, (d.value / max) * 100)}%`,
              backgroundColor: `var(${colorVar})`,
            }}
            title={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
          />
          <span className="text-[10px] text-[var(--muted)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
