"use client";

import { Landmark, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { sincronizareBanca, type TranzactieBanca } from "@/lib/mock/financiar";

const columns: Column<TranzactieBanca>[] = [
  { key: "data", label: "Dată", sortable: true, render: (row) => formatDate(row.data) },
  { key: "descriere", label: "Descriere", sortable: true },
  { key: "sursa", label: "Sursă", sortable: true },
  {
    key: "suma",
    label: "Sumă",
    align: "right",
    sortable: true,
    render: (row) => (
      <span className={row.suma < 0 ? "text-[var(--pink-600)]" : "text-[var(--foreground)]"}>
        {row.suma < 0 ? "-" : "+"}
        {formatCurrency(Math.abs(row.suma))} lei
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={row.status === "potrivit" ? "success" : "warning"} />,
  },
];

export default function SincronizareBancaPage() {
  const nepotrivite = sincronizareBanca.filter((t) => t.status === "nepotrivit").length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Sincronizare bancă"
        description="Sincronizare plăți cu extrasul de cont"
        actions={
          <button
            disabled
            title="Disponibil când conectăm datele reale"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)] opacity-70"
          >
            <Upload size={15} />
            Încarcă extras de cont
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Tranzacții totale" value={String(sincronizareBanca.length)} tone="dark" />
        <KpiCard label="Nepotrivite" value={String(nepotrivite)} sublabel="necesită verificare manuală" />
        <KpiCard
          label="Potrivite automat"
          value={String(sincronizareBanca.length - nepotrivite)}
        />
      </div>
      <SectionCard title="Tranzacții recente" icon={Landmark}>
        <DataTable
          columns={columns}
          rows={sincronizareBanca}
          getRowKey={(row) => row.id}
          searchable={(row, q) => row.descriere.toLowerCase().includes(q) || row.sursa.toLowerCase().includes(q)}
          searchPlaceholder="Caută descriere sau sursă..."
        />
      </SectionCard>
    </div>
  );
}
