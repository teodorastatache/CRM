import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { ensureComenziMareSeeded } from "@/lib/comenzi-db";
import { ComenziMareClient } from "./comenzi-mare-client";

export const dynamic = "force-dynamic";

export default async function ComenziMarePage() {
  await ensureComenziMareSeeded();
  const rows = await prisma.comandaMare.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Comenzi marfă (mare/vapor)" description="Comenzi de marfă transportate pe cale maritimă" />
      <ComenziMareClient initialRows={rows} />
    </div>
  );
}
