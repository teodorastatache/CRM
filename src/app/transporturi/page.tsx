import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { ensureTransporturiSeeded } from "@/lib/transporturi-db";
import { TransporturiClient } from "./transporturi-client";

export const dynamic = "force-dynamic";

export default async function TransporturiPage() {
  await ensureTransporturiSeeded();
  const rows = await prisma.transport.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Transporturi" description="În pregătire, pe drum și finalizate" />
      <TransporturiClient initialRows={rows} />
    </div>
  );
}
