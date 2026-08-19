"use client";

import { ClipboardCheck, Phone, MessageCircle, Star, ListChecks, Headset } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { reportajeAngajati, type RaportAngajat, type RaportZilnicAngajat } from "@/lib/mock/reportaje";

const istoricColumns: Column<RaportZilnicAngajat>[] = [
  { key: "data", label: "Zi", sortable: true },
  { key: "apeluri", label: "Apeluri", align: "right", sortable: true },
  { key: "discutiiClienti", label: "Discuții clienți", align: "right", sortable: true },
  { key: "recenzii", label: "Recenzii obținute", align: "right", sortable: true },
  { key: "listari", label: "Listări efectuate", align: "right", sortable: true },
  { key: "suportRezolvat", label: "Suport rezolvat", align: "right", sortable: true },
];

function AngajatTab({ raport }: { raport: RaportAngajat }) {
  const azi = raport.istoric[raport.istoric.length - 1];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiCard label="Apeluri azi" value={String(azi.apeluri)} icon={Phone} tone="dark" />
        <KpiCard label="Discuții clienți" value={String(azi.discutiiClienti)} icon={MessageCircle} />
        <KpiCard label="Recenzii obținute" value={String(azi.recenzii)} icon={Star} />
        <KpiCard label="Listări efectuate" value={String(azi.listari)} icon={ListChecks} />
        <KpiCard label="Suport rezolvat" value={String(azi.suportRezolvat)} icon={Headset} />
      </div>
      <DataTable columns={istoricColumns} rows={raport.istoric} getRowKey={(row) => row.data} />
    </div>
  );
}

export default function ReportajeAngajatiPage() {
  const tabs: TabItem[] = reportajeAngajati.map((raport) => ({
    key: raport.angajatId,
    label: raport.angajat,
    content: <AngajatTab raport={raport} />,
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Raport zilnic angajați" description="Apeluri, discuții clienți, recenzii, listări, suport — câte un raport per angajat" />
      <SectionCard title="Selectează angajat" icon={ClipboardCheck}>
        <Tabs tabs={tabs} />
      </SectionCard>
    </div>
  );
}
