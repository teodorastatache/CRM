"use client";

import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/format";
import { comenziPlatformeZilnic, type ComenziZi } from "@/lib/mock/rapoarte";

const columns: Column<ComenziZi>[] = [
  { key: "data", label: "Zi", sortable: true },
  { key: "shopify", label: "Comenzi Shopify", align: "right", sortable: true },
  { key: "emag", label: "Comenzi eMAG", align: "right", sortable: true },
  { key: "trendyol", label: "Comenzi Trendyol", align: "right", sortable: true },
  {
    key: "total",
    label: "Total sumă",
    align: "right",
    sortable: true,
    sortValue: (row) => row.sumaShopify + row.sumaEmag + row.sumaTrendyol,
    render: (row) => `${formatCurrency(row.sumaShopify + row.sumaEmag + row.sumaTrendyol)} lei`,
  },
];

export default function ComenziPlatformePage() {
  const totalComenzi = comenziPlatformeZilnic.reduce((s, r) => s + r.shopify + r.emag + r.trendyol, 0);
  const totalSuma = comenziPlatformeZilnic.reduce((s, r) => s + r.sumaShopify + r.sumaEmag + r.sumaTrendyol, 0);
  const comenziChartData = comenziPlatformeZilnic.map((r) => ({ label: r.data, value: r.shopify + r.emag + r.trendyol }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Comenzi pe platforme" description="Număr comenzi și sume pe zi, lună, per platformă" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Comenzi (ultimele 7 zile)" value={String(totalComenzi)} tone="dark" />
        <KpiCard label="Sumă totală" value={formatCurrency(totalSuma)} suffix="lei" />
        <KpiCard label="Medie zilnică comenzi" value={String(Math.round(totalComenzi / comenziPlatformeZilnic.length))} />
      </div>
      <SectionCard title="Total comenzi pe zi" icon={BarChart3}>
        <MiniBarChart data={comenziChartData} />
      </SectionCard>
      <SectionCard title="Detaliu pe platformă" icon={BarChart3}>
        <DataTable columns={columns} rows={comenziPlatformeZilnic} getRowKey={(row) => row.data} />
      </SectionCard>
    </div>
  );
}
