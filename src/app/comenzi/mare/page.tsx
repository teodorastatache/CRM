"use client";

import { Ship } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { comenziMare, type ComandaMare } from "@/lib/mock/comenzi";

const statusTone: Record<ComandaMare["status"], StatusTone> = {
  "în pregătire": "neutral",
  "pe drum": "info",
  finalizat: "success",
};

const columns: Column<ComandaMare>[] = [
  { key: "id", label: "Nr.", sortable: true },
  { key: "furnizor", label: "Furnizor", sortable: true },
  { key: "produse", label: "Produse", sortable: true },
  { key: "cantitate", label: "Cantitate", align: "right", sortable: true },
  { key: "dataPlecare", label: "Plecare", sortable: true, render: (row) => (row.dataPlecare === "—" ? "—" : formatDate(row.dataPlecare)) },
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

export default function ComenziMarePage() {
  const totalValoare = comenziMare.reduce((s, r) => s + r.valoare, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Comenzi marfă (mare/vapor)" description="Comenzi de marfă transportate pe cale maritimă" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Comenzi active" value={String(comenziMare.length)} tone="dark" />
        <KpiCard label="Valoare totală" value={formatCurrency(totalValoare)} suffix="lei" />
        <KpiCard label="Pe drum" value={String(comenziMare.filter((c) => c.status === "pe drum").length)} />
      </div>
      <SectionCard title="Toate comenzile" icon={Ship}>
        <DataTable
          columns={columns}
          rows={comenziMare}
          getRowKey={(row) => row.id}
          searchable={(row, q) => row.furnizor.toLowerCase().includes(q) || row.produse.toLowerCase().includes(q)}
          searchPlaceholder="Caută furnizor sau produs..."
        />
      </SectionCard>
    </div>
  );
}
