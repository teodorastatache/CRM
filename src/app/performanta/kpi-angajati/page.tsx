"use client";

import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatPercent } from "@/lib/format";
import { kpiAngajati, type KpiAngajatRow } from "@/lib/mock/performanta";

const columns: Column<KpiAngajatRow>[] = [
  { key: "angajat", label: "Angajat", sortable: true },
  { key: "rol", label: "Rol", sortable: true },
  {
    key: "rateConversieRecenzii",
    label: "Rată conversie recenzii",
    align: "right",
    sortable: true,
    render: (row) => formatPercent(row.rateConversieRecenzii),
  },
  { key: "listariRealizate", label: "Listări realizate", align: "right", sortable: true },
  { key: "cadouriTrimise", label: "Cadouri trimise", align: "right", sortable: true },
];

export default function KpiAngajatiPage() {
  const mediaConversie = kpiAngajati.reduce((s, r) => s + r.rateConversieRecenzii, 0) / kpiAngajati.length;
  const totalListari = kpiAngajati.reduce((s, r) => s + r.listariRealizate, 0);
  const totalCadouri = kpiAngajati.reduce((s, r) => s + r.cadouriTrimise, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="KPI angajați" description="Rată conversie recenzii, listări realizate, cadouri trimise" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Rată medie conversie" value={formatPercent(mediaConversie)} tone="dark" />
        <KpiCard label="Total listări" value={String(totalListari)} />
        <KpiCard label="Total cadouri trimise" value={String(totalCadouri)} />
      </div>
      <SectionCard title="Pe angajat" icon={Users}>
        <DataTable
          columns={columns}
          rows={kpiAngajati}
          getRowKey={(row) => row.angajat}
          searchable={(row, q) => row.angajat.toLowerCase().includes(q) || row.rol.toLowerCase().includes(q)}
          searchPlaceholder="Caută angajat sau rol..."
        />
      </SectionCard>
    </div>
  );
}
