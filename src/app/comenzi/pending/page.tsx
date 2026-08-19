"use client";

import { Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { comenziPending, type ComandaPending } from "@/lib/mock/comenzi";

const columns: Column<ComandaPending>[] = [
  { key: "id", label: "Nr.", sortable: true },
  { key: "furnizor", label: "Furnizor", sortable: true },
  { key: "produse", label: "Produse", sortable: true },
  { key: "valoare", label: "Valoare", align: "right", sortable: true, render: (row) => `${formatCurrency(row.valoare)} lei` },
  { key: "motivPending", label: "Motiv" },
  { key: "dataCreare", label: "Creată la", sortable: true, render: (row) => formatDate(row.dataCreare) },
];

export default function ComenziPendingPage() {
  const totalValoare = comenziPending.reduce((s, r) => s + r.valoare, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Comenzi pending" description="Comenzi în așteptare de confirmare sau plată" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Comenzi în așteptare" value={String(comenziPending.length)} tone="dark" />
        <KpiCard label="Valoare totală" value={formatCurrency(totalValoare)} suffix="lei" />
      </div>
      <SectionCard title="Toate comenzile pending" icon={Clock}>
        <DataTable
          columns={columns}
          rows={comenziPending}
          getRowKey={(row) => row.id}
          searchable={(row, q) => row.furnizor.toLowerCase().includes(q) || row.produse.toLowerCase().includes(q)}
          searchPlaceholder="Caută furnizor sau produs..."
        />
      </SectionCard>
    </div>
  );
}
