"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { type Column } from "@/components/ui/data-table";
import { EditableComenziTable, type ComenziFieldDef } from "@/components/comenzi/editable-comenzi-table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ComandaPending } from "@prisma/client";

const columns: Column<ComandaPending>[] = [
  { key: "id", label: "Nr.", sortable: true },
  { key: "furnizor", label: "Furnizor", sortable: true },
  { key: "produse", label: "Produse", sortable: true },
  { key: "valoare", label: "Valoare", align: "right", sortable: true, render: (row) => `${formatCurrency(row.valoare)} lei` },
  { key: "motivPending", label: "Motiv" },
  { key: "dataCreare", label: "Creată la", sortable: true, render: (row) => formatDate(row.dataCreare) },
];

const fields: ComenziFieldDef[] = [
  { key: "furnizor", label: "Furnizor", type: "text" },
  { key: "produse", label: "Produse", type: "text" },
  { key: "valoare", label: "Valoare (lei)", type: "number" },
  { key: "motivPending", label: "Motiv", type: "text" },
  { key: "dataCreare", label: "Data creare", type: "date" },
];

export function ComenziPendingClient({ initialRows }: { initialRows: ComandaPending[] }) {
  const [rows, setRows] = useState<ComandaPending[]>(initialRows);
  const totalValoare = rows.reduce((s, r) => s + r.valoare, 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Comenzi în așteptare" value={String(rows.length)} tone="dark" />
        <KpiCard label="Valoare totală" value={formatCurrency(totalValoare)} suffix="lei" />
      </div>
      <SectionCard title="Toate comenzile pending" icon={Clock}>
        <EditableComenziTable
          apiBase="/api/comenzi/pending"
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
