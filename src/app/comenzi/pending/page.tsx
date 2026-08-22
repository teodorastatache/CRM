import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { ensureComenziPendingSeeded } from "@/lib/comenzi-db";
import { ComenziPendingClient } from "./comenzi-pending-client";

export const dynamic = "force-dynamic";

export default async function ComenziPendingPage() {
  await ensureComenziPendingSeeded();
  const rows = await prisma.comandaPending.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Comenzi pending" description="Comenzi în așteptare de confirmare sau plată" />
      <ComenziPendingClient initialRows={rows} />
    </div>
  );
}
