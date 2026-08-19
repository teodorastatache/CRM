"use client";

import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatCurrency, formatPercent } from "@/lib/format";
import { kpiIncasariProfit, type KpiIncasariProfitRow } from "@/lib/mock/performanta";

const columns: Column<KpiIncasariProfitRow>[] = [
  { key: "angajat", label: "Angajat", sortable: true },
  {
    key: "incasariGenerate",
    label: "Încasări generate",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.incasariGenerate)} lei`,
  },
  {
    key: "profitAtribuit",
    label: "Profit atribuit",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.profitAtribuit)} lei`,
  },
  {
    key: "marja",
    label: "Marjă",
    align: "right",
    sortable: true,
    render: (row) => formatPercent(row.marja),
  },
];

export default function KpiIncasariProfitPage() {
  const totalIncasari = kpiIncasariProfit.reduce((s, r) => s + r.incasariGenerate, 0);
  const totalProfit = kpiIncasariProfit.reduce((s, r) => s + r.profitAtribuit, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="KPI încasări și profit" description="Încasări generate și profit atribuit per angajat" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total încasări generate" value={formatCurrency(totalIncasari)} suffix="lei" tone="dark" />
        <KpiCard label="Total profit atribuit" value={formatCurrency(totalProfit)} suffix="lei" />
        <KpiCard label="Marjă medie" value={formatPercent(totalProfit / totalIncasari)} />
      </div>
      <SectionCard title="Pe angajat" icon={TrendingUp}>
        <DataTable
          columns={columns}
          rows={kpiIncasariProfit}
          getRowKey={(row) => row.angajat}
          searchable={(row, q) => row.angajat.toLowerCase().includes(q)}
          searchPlaceholder="Caută angajat..."
        />
      </SectionCard>
    </div>
  );
}
