"use client";

import { Plane } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { comenziAvion, type ComandaAvion } from "@/lib/mock/comenzi";

const statusTone: Record<ComandaAvion["status"], StatusTone> = {
  "în pregătire": "neutral",
  "pe drum": "info",
  finalizat: "success",
};

const columns: Column<ComandaAvion>[] = [
  { key: "id", label: "Nr.", sortable: true },
  { key: "furnizor", label: "Furnizor", sortable: true },
  { key: "produse", label: "Produse", sortable: true },
  { key: "cantitate", label: "Cantitate", align: "right", sortable: true },
  { key: "awb", label: "AWB", sortable: true },
  { key: "dataSosireEstimata", label: "Sosire estimată", sortable: true, render: (row) => formatDate(row.dataSosireEstimata) },
  { key: "valoare", label: "Valoare", align: "right", sortable: true, render: (row) => `${formatCurrency(row.valoare)} lei` },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={statusTone[row.status]} />,
  },
];

export default function ComenziAvionPage() {
  const totalValoare = comenziAvion.reduce((s, r) => s + r.valoare, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Comenzi avion" description="Comenzi de marfă transportate aerian" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Comenzi active" value={String(comenziAvion.length)} tone="dark" />
        <KpiCard label="Valoare totală" value={formatCurrency(totalValoare)} suffix="lei" />
        <KpiCard label="Pe drum" value={String(comenziAvion.filter((c) => c.status === "pe drum").length)} />
      </div>
      <SectionCard title="Toate comenzile" icon={Plane}>
        <DataTable
          columns={columns}
          rows={comenziAvion}
          getRowKey={(row) => row.id}
          searchable={(row, q) => row.furnizor.toLowerCase().includes(q) || row.produse.toLowerCase().includes(q)}
          searchPlaceholder="Caută furnizor sau produs..."
        />
      </SectionCard>
    </div>
  );
}
