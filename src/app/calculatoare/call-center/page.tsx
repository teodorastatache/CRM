"use client";

import { Headset } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import {
  contracteCallCenter,
  listeTrimiseCallCenter,
  raportRecenziiConversieCallCenter,
  cadouriDeTrimis,
  type ContractRow,
  type ListaTrimisaRow,
  type RaportRecenziiConversieRow,
  type CadouRow,
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

const listeColumns: Column<ListaTrimisaRow>[] = [
  { key: "id", label: "Nr.", sortable: true },
  { key: "client", label: "Client", sortable: true },
  { key: "nrContacte", label: "Nr. contacte", align: "right", sortable: true },
  { key: "dataTrimitere", label: "Dată trimitere", sortable: true, render: (row) => formatDate(row.dataTrimitere) },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={row.status === "finalizată" ? "success" : "info"} />,
  },
];

const raportColumns: Column<RaportRecenziiConversieRow>[] = [
  { key: "client", label: "Client", sortable: true },
  { key: "listeTrimise", label: "Liste trimise", align: "right", sortable: true },
  { key: "recenziiObtinute", label: "Recenzii obținute", align: "right", sortable: true },
  { key: "rataConversie", label: "Rată conversie", align: "right", sortable: true, render: (row) => formatPercent(row.rataConversie) },
];

const cadouriColumns: Column<CadouRow>[] = [
  { key: "client", label: "Client", sortable: true },
  { key: "produs", label: "Produs", sortable: true },
  { key: "adresa", label: "Adresă", sortable: true },
  {
    key: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => <StatusBadge label={row.status} tone={row.status === "trimis" ? "success" : "warning"} />,
  },
];

export default function CalculatorCallCenterPage() {
  const tabs: TabItem[] = [
    {
      key: "contracte",
      label: "Contracte",
      content: <DataTable columns={contracteColumns} rows={contracteCallCenter} getRowKey={(row) => row.client} />,
    },
    {
      key: "liste",
      label: "Liste trimise",
      content: <DataTable columns={listeColumns} rows={listeTrimiseCallCenter} getRowKey={(row) => row.id} />,
    },
    {
      key: "raport",
      label: "Raport recenzii & conversie",
      content: (
        <DataTable columns={raportColumns} rows={raportRecenziiConversieCallCenter} getRowKey={(row) => row.client} />
      ),
    },
    {
      key: "cadouri",
      label: "Cadouri de trimis",
      content: <DataTable columns={cadouriColumns} rows={cadouriDeTrimis} getRowKey={(row, i) => `${row.client}-${i}`} />,
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Calculator Call center"
        description="Contracte, liste trimise, rată conversie, cadouri"
      />
      <SectionCard title="Call center" icon={Headset}>
        <Tabs tabs={tabs} />
      </SectionCard>
    </div>
  );
}
