"use client";

import { Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { transporturi, type Transport, type TransportStatus } from "@/lib/mock/transporturi";

const columns: Column<Transport>[] = [
  { key: "id", label: "Nr.", sortable: true },
  { key: "furnizor", label: "Furnizor", sortable: true },
  { key: "produse", label: "Produse", sortable: true },
  { key: "cantitate", label: "Cantitate", align: "right", sortable: true },
  { key: "tip", label: "Tip", sortable: true },
  { key: "dataPlecare", label: "Plecare", sortable: true, render: (row) => (row.dataPlecare === "—" ? "—" : formatDate(row.dataPlecare)) },
  {
    key: "dataEstimataSosire",
    label: "Sosire estimată",
    sortable: true,
    render: (row) => formatDate(row.dataEstimataSosire),
  },
  {
    key: "valoare",
    label: "Valoare",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.valoare)} lei`,
  },
];

function StatusTab({ status }: { status: TransportStatus }) {
  const rows = transporturi.filter((t) => t.status === status);
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      searchable={(row, q) => row.furnizor.toLowerCase().includes(q) || row.produse.toLowerCase().includes(q)}
      searchPlaceholder="Caută furnizor sau produs..."
      emptyLabel="Niciun transport în această categorie"
    />
  );
}

export default function TransporturiPage() {
  const statuses: TransportStatus[] = ["în pregătire", "pe drum", "finalizat"];
  const tabs: TabItem[] = statuses.map((status) => ({
    key: status,
    label: `${status[0].toUpperCase()}${status.slice(1)} (${transporturi.filter((t) => t.status === status).length})`,
    content: <StatusTab status={status} />,
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Transporturi" description="În pregătire, pe drum și finalizate" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statuses.map((status) => (
          <KpiCard
            key={status}
            label={`${status[0].toUpperCase()}${status.slice(1)}`}
            value={String(transporturi.filter((t) => t.status === status).length)}
            sublabel="transporturi"
            icon={Truck}
            tone={status === "pe drum" ? "dark" : "pink"}
          />
        ))}
      </div>
      <SectionCard title="Toate transporturile" icon={Truck}>
        <Tabs tabs={tabs} defaultKey="pe drum" />
      </SectionCard>
    </div>
  );
}
