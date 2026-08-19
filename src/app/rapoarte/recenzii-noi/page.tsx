import { Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { formatDate } from "@/lib/format";
import { recenziiNoi } from "@/lib/mock/rapoarte";

export default function RecenziiNoiPage() {
  const mediaRating = recenziiNoi.reduce((s, r) => s + r.rating, 0) / recenziiNoi.length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader title="Recenzii firmă proprie" description="Recenzii recente obținute pentru brandul propriu" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Recenzii recente" value={String(recenziiNoi.length)} tone="dark" />
        <KpiCard label="Rating mediu" value={mediaRating.toFixed(1)} suffix="/ 5" />
      </div>
      <SectionCard title="Cele mai recente recenzii" icon={Star}>
        <div className="flex flex-col gap-2.5">
          {recenziiNoi.map((review) => (
            <div
              key={review.id}
              className="flex flex-col gap-1.5 rounded-xl border border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < review.rating ? "fill-[var(--pink-500)] text-[var(--pink-500)]" : "text-[var(--border)]"}
                    />
                  ))}
                  <span className="ml-1 text-xs text-[var(--muted)]">{review.client} · {formatDate(review.data)}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{review.produs}</p>
                <p className="text-sm text-[var(--muted)]">{review.text}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
