"use client";

import { Award } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatPercent } from "@/lib/format";
import { recenziiAngajat, type RecenzieAngajatRow } from "@/lib/mock/rapoarte";

const columns: Column<RecenzieAngajatRow>[] = [
  { key: "angajat", label: "Angajat", sortable: true },
  { key: "recenziiLuna", label: "Recenzii lună curentă", align: "right", sortable: true },
  {
    key: "rataConversie",
    label: "Rată conversie",
    align: "right",
    sortable: true,
    render: (row) => formatPercent(row.rataConversie),
  },
];

export default function RecenziiAngajatPage() {
  const sorted = [...recenziiAngajat].sort((a, b) => b.recenziiLuna - a.recenziiLuna);
  const lider = sorted[0];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Recenzii per angajat" description="Numărul de recenzii obținute de fiecare angajat" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Lider luna curentă" value={lider?.angajat ?? "—"} sublabel={`${lider?.recenziiLuna ?? 0} recenzii`} tone="dark" />
        <KpiCard
          label="Total recenzii echipă"
          value={String(recenziiAngajat.reduce((s, r) => s + r.recenziiLuna, 0))}
        />
      </div>
      <SectionCard title="Clasament" icon={Award}>
        <DataTable
          columns={columns}
          rows={recenziiAngajat}
          getRowKey={(row) => row.angajat}
          searchable={(row, q) => row.angajat.toLowerCase().includes(q)}
          searchPlaceholder="Caută angajat..."
        />
      </SectionCard>
    </div>
  );
}
