"use client";

import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { facturiDeAchitat, type FacturaDeAchitat } from "@/lib/mock/financiar";

const statusTone: Record<FacturaDeAchitat["status"], StatusTone> = {
  urgent: "critical",
  "în termen": "warning",
  achitat: "success",
};

const columns: Column<FacturaDeAchitat>[] = [
  { key: "id", label: "Nr. factură", sortable: true },
  { key: "furnizor", label: "Furnizor", sortable: true },
  {
    key: "suma",
    label: "Sumă",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.suma)} lei`,
  },
  {
    key: "scadenta",
    label: "Scadență",
    sortable: true,
    render: (row) => formatDate(row.scadenta),
  },
  {
    key: "zilePanaLaScadenta",
    label: "Zile până la scadență",
    align: "right",
    sortable: true,
    render: (row) => (row.zilePanaLaScadenta >= 0 ? `${row.zilePanaLaScadenta} zile` : `achitată`),
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={statusTone[row.status]} />,
  },
];

export default function FacturiDeAchitatPage() {
  const neachitate = facturiDeAchitat.filter((f) => f.status !== "achitat");
  const totalDeAchitat = neachitate.reduce((s, r) => s + r.suma, 0);
  const urgente = neachitate.filter((f) => f.status === "urgent").length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Facturi de achitat" description="Facturi furnizori cu scadență, urmărire termene" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total de achitat" value={formatCurrency(totalDeAchitat)} suffix="lei" tone="dark" />
        <KpiCard label="Facturi urgente" value={String(urgente)} sublabel="scadență în ≤3 zile" />
        <KpiCard label="Facturi în evidență" value={String(neachitate.length)} sublabel="neachitate" />
      </div>
      <SectionCard title="Toate facturile" icon={AlertTriangle}>
        <DataTable
          columns={columns}
          rows={facturiDeAchitat}
          getRowKey={(row) => row.id}
          searchable={(row, q) => row.furnizor.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)}
          searchPlaceholder="Caută furnizor sau nr. factură..."
        />
      </SectionCard>
    </div>
  );
}
