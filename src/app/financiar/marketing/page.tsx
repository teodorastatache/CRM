"use client";

import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, formatPercent } from "@/lib/format";
import { marketingBuget } from "@/lib/mock/financiar";

export default function MarketingBudgetPage() {
  const totalAlocat = marketingBuget.reduce((s, r) => s + r.bugetAlocat, 0);
  const totalCheltuit = marketingBuget.reduce((s, r) => s + r.cheltuit, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Buget marketing și reclamă" description="Bugete alocate vs. cheltuite pe canal · august 2026" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Buget total alocat" value={formatCurrency(totalAlocat)} suffix="lei" tone="dark" />
        <KpiCard label="Total cheltuit" value={formatCurrency(totalCheltuit)} suffix="lei" />
        <KpiCard label="Buget rămas" value={formatCurrency(totalAlocat - totalCheltuit)} suffix="lei" />
      </div>
      <SectionCard title="Alocat vs. cheltuit pe canal" icon={Megaphone}>
        <div className="flex flex-col gap-5">
          {marketingBuget.map((row) => {
            const pct = row.cheltuit / row.bugetAlocat;
            return (
              <div key={row.canal}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-[var(--foreground)]">{row.canal}</span>
                  <span className="text-[var(--muted)]">
                    {formatCurrency(row.cheltuit)} / {formatCurrency(row.bugetAlocat)} lei ·{" "}
                    <strong className={pct >= 1 ? "text-[var(--pink-600)]" : "text-[var(--foreground)]"}>
                      {formatPercent(pct)}
                    </strong>
                  </span>
                </div>
                <ProgressBar value={row.cheltuit} max={row.bugetAlocat} colorVar={pct >= 1 ? "--pink-600" : "--pink-400"} />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
