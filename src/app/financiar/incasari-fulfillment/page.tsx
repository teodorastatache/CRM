"use client";

import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/format";
import { incasariFulfillmentPerFirma, type IncasareFulfillmentFirma } from "@/lib/mock/financiar";

const columns: Column<IncasareFulfillmentFirma>[] = [
  { key: "firma", label: "Firmă client", sortable: true },
  { key: "nrComenzi", label: "Nr. comenzi", align: "right", sortable: true },
  {
    key: "facturat",
    label: "Facturat",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.facturat)} lei`,
  },
  {
    key: "incasat",
    label: "Încasat",
    align: "right",
    sortable: true,
    render: (row) => (
      <div className="flex flex-col items-end gap-1">
        <span>{formatCurrency(row.incasat)} lei</span>
        <div className="w-28">
          <ProgressBar value={row.incasat} max={row.facturat} colorVar={row.restDeIncasat > 0 ? "--pink-400" : "--pink-500"} />
        </div>
      </div>
    ),
  },
  {
    key: "restDeIncasat",
    label: "Rest de încasat",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.restDeIncasat)} lei`,
  },
];

export default function IncasariFulfillmentPage() {
  const totalFacturat = incasariFulfillmentPerFirma.reduce((s, r) => s + r.facturat, 0);
  const totalIncasat = incasariFulfillmentPerFirma.reduce((s, r) => s + r.incasat, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Încasări fulfillment pe firmă" description="Defalcare încasări fulfillment pentru fiecare firmă client" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total facturat" value={formatCurrency(totalFacturat)} suffix="lei" tone="dark" />
        <KpiCard label="Total încasat" value={formatCurrency(totalIncasat)} suffix="lei" />
        <KpiCard label="Rest de încasat" value={formatCurrency(totalFacturat - totalIncasat)} suffix="lei" />
      </div>
      <SectionCard title="Pe firmă client" icon={Boxes}>
        <DataTable
          columns={columns}
          rows={incasariFulfillmentPerFirma}
          getRowKey={(row) => row.firma}
          searchable={(row, q) => row.firma.toLowerCase().includes(q)}
          searchPlaceholder="Caută firmă..."
        />
      </SectionCard>
    </div>
  );
}
