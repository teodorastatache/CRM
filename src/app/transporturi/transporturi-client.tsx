"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { type Column } from "@/components/ui/data-table";
import { EditableComenziTable, type ComenziFieldDef } from "@/components/comenzi/editable-comenzi-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_COMANDA } from "@/lib/comenzi-db";
import type { Transport } from "@prisma/client";

const TIP_TRANSPORT = ["container", "colet aerian"] as const;

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

const fields: ComenziFieldDef[] = [
  { key: "furnizor", label: "Furnizor", type: "text" },
  { key: "produse", label: "Produse", type: "text" },
  { key: "cantitate", label: "Cantitate", type: "number" },
  { key: "tip", label: "Tip", type: "select", options: TIP_TRANSPORT },
  { key: "dataPlecare", label: "Data plecare (lasă gol dacă nu a plecat)", type: "date" },
  { key: "dataEstimataSosire", label: "Data sosire estimată", type: "date" },
  { key: "valoare", label: "Valoare (lei)", type: "number" },
  { key: "status", label: "Status", type: "select", options: STATUS_COMANDA },
];

export function TransporturiClient({ initialRows }: { initialRows: Transport[] }) {
  const [rows, setRows] = useState<Transport[]>(initialRows);
  const statuses = STATUS_COMANDA;

  const tabs: TabItem[] = statuses.map((status) => ({
    key: status,
    label: `${status[0].toUpperCase()}${status.slice(1)} (${rows.filter((t) => t.status === status).length})`,
    content: (
      <EditableComenziTable
        apiBase="/api/transporturi"
        rows={rows.filter((t) => t.status === status)}
        onRowsChange={setRows}
        columns={columns}
        fields={fields}
        searchable={(row, q) => row.furnizor.toLowerCase().includes(q) || row.produse.toLowerCase().includes(q)}
        searchPlaceholder="Caută furnizor sau produs..."
        addLabel="Transport nou"
        emptyLabel="Niciun transport în această categorie"
      />
    ),
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statuses.map((status) => (
          <KpiCard
            key={status}
            label={`${status[0].toUpperCase()}${status.slice(1)}`}
            value={String(rows.filter((t) => t.status === status).length)}
            sublabel="transporturi"
            icon={Truck}
            tone={status === "pe drum" ? "dark" : "pink"}
          />
        ))}
      </div>
      <SectionCard title="Toate transporturile" icon={Truck}>
        <Tabs tabs={tabs} defaultKey="pe drum" />
      </SectionCard>
    </>
  );
}
