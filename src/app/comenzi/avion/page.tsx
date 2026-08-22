import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { ensureComenziAvionSeeded } from "@/lib/comenzi-db";
import { ComenziAvionClient } from "./comenzi-avion-client";

export const dynamic = "force-dynamic";

export default async function ComenziAvionPage() {
  await ensureComenziAvionSeeded();
  const rows = await prisma.comandaAvion.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Comenzi avion" description="Comenzi de marfă transportate aerian" />
      <ComenziAvionClient initialRows={rows} />
    </div>
  );
}
