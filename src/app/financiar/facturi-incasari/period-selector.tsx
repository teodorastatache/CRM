"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LUNI = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

export type PeriodMode = "month" | "year" | "day";

export function PeriodSelector({
  mode,
  year,
  month,
  day,
}: {
  mode: PeriodMode;
  year: number;
  month: number;
  day: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(next: Partial<{ mode: PeriodMode; year: number; month: number; day: string }>) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { mode, year, month, day, ...next };
    params.set("mode", merged.mode);
    params.set("year", String(merged.year));
    params.set("month", String(merged.month));
    params.set("day", merged.day);
    router.push(`${pathname}?${params.toString()}`);
    // Pagina e force-dynamic, dar navigarea doar prin searchParams poate
    // reutiliza cache-ul de rutare al clientului — forțăm un refresh real.
    router.refresh();
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getUTCFullYear() - i);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-[var(--border)] bg-[var(--beige-50)] p-0.5 text-sm">
        {(
          [
            ["month", "Lună"],
            ["year", "An"],
            ["day", "Zi"],
          ] as [PeriodMode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => update({ mode: m })}
            className={`rounded-md px-3 py-1.5 font-semibold transition-colors ${
              mode === m
                ? "bg-[var(--pink-500)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "month" && (
        <>
          <select
            value={month}
            onChange={(e) => update({ month: Number(e.target.value) })}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none"
          >
            {LUNI.map((label, i) => (
              <option key={label} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => update({ year: Number(e.target.value) })}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </>
      )}

      {mode === "year" && (
        <select
          value={year}
          onChange={(e) => update({ year: Number(e.target.value) })}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      )}

      {mode === "day" && (
        <input
          type="date"
          value={day}
          onChange={(e) => update({ day: e.target.value })}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none"
        />
      )}
    </div>
  );
}
