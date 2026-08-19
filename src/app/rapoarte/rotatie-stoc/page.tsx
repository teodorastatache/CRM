"use client";

import { PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/format";
import { rotatieStoc, type RotatieStocRow } from "@/lib/mock/rapoarte";

const columns: Column<RotatieStocRow>[] = [
  { key: "sku", label: "SKU", sortable: true },
  { key: "produs", label: "Produs", sortable: true },
  { key: "stocCurent", label: "Stoc curent", align: "right", sortable: true },
  { key: "vitezaRotatieZile", label: "Viteză rotație (zile)", align: "right", sortable: true },
  {
    key: "valoareStocMort",
    label: "Valoare stoc mort",
    align: "right",
    sortable: true,
    render: (row) => (row.valoareStocMort > 0 ? `${formatCurrency(row.valoareStocMort)} lei` : "—"),
  },
  {
    key: "zileRamaseStoc",
    label: "Zile rămase de stoc",
    align: "right",
    sortable: true,
    render: (row) => (
      <StatusBadge
        label={`${row.zileRamaseStoc} zile`}
        tone={row.zileRamaseStoc <= 7 ? "critical" : row.zileRamaseStoc <= 30 ? "warning" : "success"}
      />
    ),
  },
];

export default function RotatieStocPage() {
  const stocMort = rotatieStoc.reduce((s, r) => s + r.valoareStocMort, 0);
  const critice = rotatieStoc.filter((r) => r.zileRamaseStoc <= 7).length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Rotație stoc produse"
        description="Viteză rotație, valoare stoc mort, zile rămase de stoc la ritmul actual de vânzare"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Produse critice (≤7 zile)" value={String(critice)} tone="dark" />
        <KpiCard label="Valoare stoc mort" value={formatCurrency(stocMort)} suffix="lei" />
        <KpiCard label="Produse monitorizate" value={String(rotatieStoc.length)} />
      </div>
      <SectionCard title="Toate produsele" icon={PackageSearch}>
        <DataTable
          columns={columns}
          rows={rotatieStoc}
          getRowKey={(row) => row.sku}
          searchable={(row, q) => row.produs.toLowerCase().includes(q) || row.sku.toLowerCase().includes(q)}
          searchPlaceholder="Caută produs sau SKU..."
        />
      </SectionCard>
    </div>
  );
}
