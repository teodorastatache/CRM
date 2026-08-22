"use client";

import { useState } from "react";
import { Ship } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { type Column } from "@/components/ui/data-table";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { EditableComenziTable, type ComenziFieldDef } from "@/components/comenzi/editable-comenzi-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_COMANDA } from "@/lib/comenzi-db";
import type { ComandaMare } from "@prisma/client";

const statusTone: Record<string, StatusTone> = {
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

const fields: ComenziFieldDef[] = [
  { key: "furnizor", label: "Furnizor", type: "text" },
  { key: "produse", label: "Produse", type: "text" },
  { key: "cantitate", label: "Cantitate", type: "number" },
  { key: "dataPlecare", label: "Data plecare (lasă gol dacă nu a plecat)", type: "date" },
  { key: "dataSosireEstimata", label: "Data sosire estimată", type: "date" },
  { key: "valoare", label: "Valoare (lei)", type: "number" },
  { key: "status", label: "Status", type: "select", options: STATUS_COMANDA },
];

export function ComenziMareClient({ initialRows }: { initialRows: ComandaMare[] }) {
  const [rows, setRows] = useState<ComandaMare[]>(initialRows);
  const totalValoare = rows.reduce((s, r) => s + r.valoare, 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Comenzi active" value={String(rows.length)} tone="dark" />
        <KpiCard label="Valoare totală" value={formatCurrency(totalValoare)} suffix="lei" />
        <KpiCard label="Pe drum" value={String(rows.filter((c) => c.status === "pe drum").length)} />
      </div>
      <SectionCard title="Toate comenzile" icon={Ship}>
        <EditableComenziTable
          apiBase="/api/comenzi/mare"
          rows={rows}
          onRowsChange={setRows}
          columns={columns}
          fields={fields}
          searchable={(row, q) => row.furnizor.toLowerCase().includes(q) || row.produse.toLowerCase().includes(q)}
          searchPlaceholder="Caută furnizor sau produs..."
          addLabel="Comandă nouă"
        />
      </SectionCard>
    </>
  );
}
