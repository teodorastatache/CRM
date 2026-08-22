"use client";

import { ReceiptText } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { IncasariRow, PlatformaIncasari } from "@/lib/mock/financiar";

const platformLabels: Record<PlatformaIncasari, string> = {
  emag: "eMAG Marketplace",
  trendyol: "Trendyol",
  site: "Site (Shopify)",
  fulfillment: "Fulfillment",
  "call-center": "Call center",
};

const statusTone: Record<IncasariRow["status"], StatusTone> = {
  încasat: "success",
  parțial: "warning",
  neîncasat: "critical",
};

const columns: Column<IncasariRow>[] = [
  { key: "id", label: "Nr.", sortable: true },
  { key: "referinta", label: "Referință", sortable: true },
  {
    key: "dataFacturii",
    label: "Dată factură",
    sortable: true,
    render: (row) => formatDate(row.dataFacturii),
  },
  {
    key: "dataScadenta",
    label: "Dată scadentă",
    sortable: true,
    render: (row) => formatDate(row.dataScadenta),
  },
  {
    key: "sumaFacturata",
    label: "Facturat",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.sumaFacturata)} lei`,
  },
  {
    key: "sumaIncasata",
    label: "Încasat",
    align: "right",
    sortable: true,
    render: (row) => `${formatCurrency(row.sumaIncasata)} lei`,
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={statusTone[row.status]} />,
  },
];

function PlatformTab({
  rows,
  totals,
  hideTable,
}: {
  rows: IncasariRow[];
  totals?: { facturat: number; incasat: number };
  hideTable?: boolean;
}) {
  const totalFacturat = totals?.facturat ?? rows.reduce((sum, r) => sum + r.sumaFacturata, 0);
  const totalIncasat = totals?.incasat ?? rows.reduce((sum, r) => sum + r.sumaIncasata, 0);
  const restDeIncasat = totalFacturat - totalIncasat;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total facturat" value={formatCurrency(totalFacturat)} suffix="lei" tone="dark" />
        <KpiCard label="Total încasat" value={formatCurrency(totalIncasat)} suffix="lei" />
        <KpiCard label="Rest de încasat" value={formatCurrency(restDeIncasat)} suffix="lei" />
      </div>
      {hideTable ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--beige-50)] px-4 py-3 text-sm text-[var(--muted)]">
          Prea multe facturi pentru afișare individuală pe un an întreg — totalurile de mai sus sunt
          calculate din toate facturile. Pentru detaliu factură cu factură, alege perioada Lună sau Zi.
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          searchable={(row, q) => row.referinta.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)}
          searchPlaceholder="Caută după referință sau nr. factură..."
        />
      )}
    </div>
  );
}

export function FacturiIncasariClient({
  platformRows,
  platformTotals,
  noTableFor,
}: {
  platformRows: Record<PlatformaIncasari, IncasariRow[]>;
  platformTotals?: Partial<Record<PlatformaIncasari, { facturat: number; incasat: number }>>;
  noTableFor?: PlatformaIncasari[];
}) {
  const tabs: TabItem[] = (Object.keys(platformRows) as PlatformaIncasari[]).map((key) => ({
    key,
    label: platformLabels[key],
    content: (
      <PlatformTab
        rows={platformRows[key]}
        totals={platformTotals?.[key]}
        hideTable={noTableFor?.includes(key)}
      />
    ),
  }));

  return (
    <SectionCard title="Defalcare pe sursă" icon={ReceiptText}>
      <Tabs tabs={tabs} />
    </SectionCard>
  );
}
