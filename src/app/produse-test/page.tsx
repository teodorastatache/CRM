"use client";

import { FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import { produseTest, type ProdusTest } from "@/lib/mock/produse-test";

const statusTone: Record<ProdusTest["status"], StatusTone> = {
  "în test": "info",
  aprobat: "success",
  respins: "critical",
};

const columns: Column<ProdusTest>[] = [
  { key: "sku", label: "SKU", sortable: true },
  { key: "produs", label: "Produs", sortable: true },
  { key: "furnizor", label: "Furnizor", sortable: true },
  { key: "dataInceput", label: "Data început test", sortable: true, render: (row) => formatDate(row.dataInceput) },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={statusTone[row.status]} />,
  },
  { key: "nota", label: "Notă" },
];

export default function ProduseTestPage() {
  const inTest = produseTest.filter((p) => p.status === "în test").length;
  const aprobate = produseTest.filter((p) => p.status === "aprobat").length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Liste produse test" description="Produse noi în fază de testare înainte de listare" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="În test" value={String(inTest)} tone="dark" />
        <KpiCard label="Aprobate" value={String(aprobate)} />
        <KpiCard label="Total produse testate" value={String(produseTest.length)} />
      </div>
      <SectionCard title="Toate produsele test" icon={FlaskConical}>
        <DataTable
          columns={columns}
          rows={produseTest}
          getRowKey={(row) => row.sku}
          searchable={(row, q) => row.produs.toLowerCase().includes(q) || row.furnizor.toLowerCase().includes(q)}
          searchPlaceholder="Caută produs sau furnizor..."
        />
      </SectionCard>
    </div>
  );
}
