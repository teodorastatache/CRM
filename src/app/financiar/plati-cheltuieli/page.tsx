"use client";

import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/format";
import { platiCheltuieli, type CheltuialaRow } from "@/lib/mock/financiar";

const columns: Column<CheltuialaRow>[] = [
  { key: "id", label: "Nr.", sortable: true },
  { key: "categorie", label: "Categorie", sortable: true },
  { key: "descriere", label: "Descriere", sortable: true },
  { key: "luna", label: "Lună", sortable: true },
  {
    key: "tip",
    label: "Tip",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.tip} tone={row.tip === "plată" ? "info" : "neutral"} />,
  },
  {
    key: "suma",
    label: "Sumă",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.suma)} lei`,
  },
];

export default function PlatiCheltuieliPage() {
  const totalPlati = platiCheltuieli.filter((r) => r.tip === "plată").reduce((s, r) => s + r.suma, 0);
  const totalCheltuieli = platiCheltuieli
    .filter((r) => r.tip === "cheltuială operațională")
    .reduce((s, r) => s + r.suma, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Plăți și cheltuieli lunare"
        description="Plăți efectuate lunar și cheltuieli operaționale"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total plăți" value={formatCurrency(totalPlati)} suffix="lei" tone="dark" />
        <KpiCard label="Total cheltuieli operaționale" value={formatCurrency(totalCheltuieli)} suffix="lei" />
        <KpiCard label="Total general" value={formatCurrency(totalPlati + totalCheltuieli)} suffix="lei" />
      </div>
      <SectionCard title="Detaliu plăți și cheltuieli · august 2026" icon={Wallet}>
        <DataTable
          columns={columns}
          rows={platiCheltuieli}
          getRowKey={(row) => row.id}
          searchable={(row, q) => row.categorie.toLowerCase().includes(q) || row.descriere.toLowerCase().includes(q)}
          searchPlaceholder="Caută categorie sau descriere..."
        />
      </SectionCard>
    </div>
  );
}
