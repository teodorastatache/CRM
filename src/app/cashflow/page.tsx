"use client";

import { Landmark, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { formatCurrency, formatDate } from "@/lib/format";
import { platiMarfa, cashflowProiectie, cashflowAlerta, type PlataMarfa } from "@/lib/mock/cashflow";

const columns: Column<PlataMarfa>[] = [
  { key: "data", label: "Dată", sortable: true, render: (row) => formatDate(row.data) },
  {
    key: "tara",
    label: "Țară",
    sortable: true,
    render: (row) => (row.tara === "china" ? "China" : "România"),
  },
  { key: "furnizor", label: "Furnizor", sortable: true },
  { key: "suma", label: "Sumă", align: "right", sortable: true, render: (row) => `${formatCurrency(row.suma)} lei` },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={row.status === "achitat" ? "success" : "info"} />,
  },
];

export default function CashflowPage() {
  const totalChina = platiMarfa.filter((p) => p.tara === "china").reduce((s, r) => s + r.suma, 0);
  const totalRomania = platiMarfa.filter((p) => p.tara === "romania").reduce((s, r) => s + r.suma, 0);
  const chartData = cashflowProiectie.map((s) => ({ label: s.luna, value: Math.max(0, s.soldProiectat) }));
  const areDeficit = cashflowAlerta.lunaDeficit !== null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Raport cashflow" description="Plăți marfă China/România și proiecție sold" />

      {areDeficit && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle size={20} className="shrink-0 text-red-600" />
          <p className="text-sm font-semibold text-red-700">
            Avertisment: soldul proiectat devine negativ în luna {cashflowAlerta.lunaDeficit}. Verifică plățile
            programate pentru a evita deficitul de cash.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Sold curent" value={formatCurrency(cashflowAlerta.soldCurent)} suffix="lei" tone="dark" />
        <KpiCard label="Plăți marfă China" value={formatCurrency(totalChina)} suffix="lei" />
        <KpiCard label="Plăți marfă România" value={formatCurrency(totalRomania)} suffix="lei" />
      </div>

      <SectionCard title="Proiecție sold pe luni" icon={Landmark}>
        <MiniBarChart data={chartData} colorVar={areDeficit ? "--pink-600" : "--pink-500"} formatValue={(v) => `${formatCurrency(v)} lei`} />
      </SectionCard>

      <SectionCard title="Plăți marfă" icon={Landmark}>
        <DataTable
          columns={columns}
          rows={platiMarfa}
          getRowKey={(row) => row.id}
          searchable={(row, q) => row.furnizor.toLowerCase().includes(q)}
          searchPlaceholder="Caută furnizor..."
        />
      </SectionCard>
    </div>
  );
}
