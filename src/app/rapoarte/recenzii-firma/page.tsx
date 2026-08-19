"use client";

import { Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { recenziiFirma, type RecenziiFirmaRow } from "@/lib/mock/rapoarte";

const columns: Column<RecenziiFirmaRow>[] = [
  { key: "firma", label: "Firmă", sortable: true },
  { key: "recenziiAzi", label: "Recenzii azi", align: "right", sortable: true },
  { key: "recenziiLuna", label: "Recenzii lună curentă", align: "right", sortable: true },
];

export default function RecenziiFirmaPage() {
  const totalAzi = recenziiFirma.reduce((s, r) => s + r.recenziiAzi, 0);
  const totalLuna = recenziiFirma.reduce((s, r) => s + r.recenziiLuna, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Recenzii pe firmă" description="Număr recenzii per firmă client și total pe zi/lună" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Recenzii azi (toate firmele)" value={String(totalAzi)} tone="dark" />
        <KpiCard label="Recenzii lună curentă" value={String(totalLuna)} />
      </div>
      <SectionCard title="Pe firmă client" icon={Star}>
        <DataTable
          columns={columns}
          rows={recenziiFirma}
          getRowKey={(row) => row.firma}
          searchable={(row, q) => row.firma.toLowerCase().includes(q)}
          searchPlaceholder="Caută firmă..."
        />
      </SectionCard>
    </div>
  );
}
