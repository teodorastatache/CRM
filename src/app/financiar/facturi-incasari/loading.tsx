import { Loader2, ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Facturi și încasări" description="Se încarcă datele din Oblio pentru perioada selectată…" />
      <SectionCard title="Defalcare pe sursă" icon={ReceiptText}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--muted)]">
          <Loader2 size={28} className="animate-spin text-[var(--pink-500)]" />
          <p className="text-sm">
            Poate dura până la un minut pentru o lună citită prima dată din Oblio — reîncercările ulterioare
            pentru aceeași perioadă vor fi instant.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
