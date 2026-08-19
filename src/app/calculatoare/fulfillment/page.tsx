"use client";

import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  contracteFulfillment,
  fiseClientiFulfillment,
  marfaReceptionata,
  facturareAutomataFulfillment,
  type ContractRow,
  type FisaClientRow,
  type MarfaReceptionataRow,
  type FacturareAutomataRow,
} from "@/lib/mock/calculatoare";

const contracteColumns: Column<ContractRow>[] = [
  { key: "client", label: "Client", sortable: true },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={row.status === "semnat" ? "success" : "warning"} />,
  },
  { key: "dataSemnare", label: "Dată semnare", sortable: true, render: (row) => (row.dataSemnare === "—" ? "—" : formatDate(row.dataSemnare)) },
  { key: "valoareLunara", label: "Valoare lunară", align: "right", sortable: true, render: (row) => `${formatCurrency(row.valoareLunara)} lei` },
];

const fiseColumns: Column<FisaClientRow>[] = [
  { key: "client", label: "Client", sortable: true },
  { key: "nrPaleti", label: "Nr. paleți", align: "right", sortable: true },
  { key: "nrRafturi", label: "Nr. rafturi", align: "right", sortable: true },
  { key: "transport", label: "Transport", sortable: true },
  { key: "nrComenziLunar", label: "Nr. comenzi/lună", align: "right", sortable: true },
];

const marfaColumns: Column<MarfaReceptionataRow>[] = [
  { key: "data", label: "Dată", sortable: true, render: (row) => formatDate(row.data) },
  { key: "client", label: "Client", sortable: true },
  { key: "produs", label: "Produs", sortable: true },
  { key: "cantitate", label: "Cantitate", align: "right", sortable: true },
];

const facturareColumns: Column<FacturareAutomataRow>[] = [
  { key: "client", label: "Client", sortable: true },
  { key: "nrComenzi", label: "Nr. comenzi", align: "right", sortable: true },
  { key: "tarifUnitar", label: "Tarif unitar", align: "right", sortable: true, render: (row) => `${row.tarifUnitar.toFixed(2)} lei` },
  { key: "totalFacturat", label: "Total facturat", align: "right", sortable: true, render: (row) => `${formatCurrency(row.totalFacturat)} lei` },
];

export default function CalculatorFulfillmentPage() {
  const tabs: TabItem[] = [
    {
      key: "contracte",
      label: "Contracte",
      content: (
        <DataTable columns={contracteColumns} rows={contracteFulfillment} getRowKey={(row) => row.client} />
      ),
    },
    {
      key: "fise",
      label: "Fișe clienți",
      content: <DataTable columns={fiseColumns} rows={fiseClientiFulfillment} getRowKey={(row) => row.client} />,
    },
    {
      key: "marfa",
      label: "Marfă recepționată",
      content: <DataTable columns={marfaColumns} rows={marfaReceptionata} getRowKey={(row, i) => `${row.client}-${i}`} />,
    },
    {
      key: "facturare",
      label: "Facturare automată",
      content: (
        <DataTable columns={facturareColumns} rows={facturareAutomataFulfillment} getRowKey={(row) => row.client} />
      ),
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Calculator Fulfillment"
        description="Contracte, fișe clienți, recepții marfă, facturare automată"
      />
      <SectionCard title="Fulfillment" icon={Calculator}>
        <Tabs tabs={tabs} />
      </SectionCard>
    </div>
  );
}
