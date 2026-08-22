import { PageHeader } from "@/components/ui/page-header";
import { platformIncasari as mockPlatformIncasari, type IncasariRow, type PlatformaIncasari } from "@/lib/mock/financiar";
import { getOblioInvoiceSummaries } from "@/lib/oblio-api";
import { FacturiIncasariClient } from "./client";
import { PeriodSelector, type PeriodMode } from "./period-selector";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

const LUNI_LABEL = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export default async function FacturiIncasariPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; year?: string; month?: string; day?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();

  const mode: PeriodMode = params.mode === "year" || params.mode === "day" ? params.mode : "month";
  const year = Number(params.year) || now.getUTCFullYear();
  const month = Math.min(12, Math.max(1, Number(params.month) || now.getUTCMonth() + 1));
  const day = params.day && /^\d{4}-\d{2}-\d{2}$/.test(params.day) ? params.day : now.toISOString().slice(0, 10);

  let issuedAfter: string;
  let issuedBefore: string;
  let periodLabel: string;

  if (mode === "year") {
    issuedAfter = `${year}-01-01`;
    issuedBefore = `${year}-12-31`;
    periodLabel = String(year);
  } else if (mode === "day") {
    issuedAfter = day;
    issuedBefore = day;
    periodLabel = new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(`${day}T00:00:00Z`)
    );
  } else {
    issuedAfter = `${year}-${pad(month)}-01`;
    issuedBefore = `${year}-${pad(month)}-${pad(lastDayOfMonth(year, month))}`;
    periodLabel = `${LUNI_LABEL[month - 1]} ${year}`;
  }

  let platformRows: Record<PlatformaIncasari, IncasariRow[]> = mockPlatformIncasari;
  let live = false;
  let unclassifiedCount = 0;

  try {
    const summaries = await getOblioInvoiceSummaries(issuedAfter, issuedBefore);
    if (summaries) {
      const grouped: Record<PlatformaIncasari, IncasariRow[]> = {
        emag: [],
        trendyol: [],
        site: [],
        fulfillment: [],
        "call-center": [],
      };
      for (const s of summaries) {
        if (s.platform === "altele") {
          unclassifiedCount += 1;
          continue;
        }
        grouped[s.platform].push({
          id: s.id,
          referinta: s.referinta,
          dataFacturii: s.dataFacturii,
          dataScadenta: s.dataScadenta,
          sumaFacturata: s.sumaFacturata,
          sumaIncasata: s.sumaIncasata,
          status: s.status,
        });
      }
      platformRows = grouped;
      live = true;
    }
  } catch {
    // Oblio indisponibil momentan — rămânem pe datele mock.
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Facturi și încasări"
        description={
          live
            ? `Date reale din Oblio · ${periodLabel}`
            : "Încasări eMAG, Trendyol, site, fulfillment și call center (date demonstrative)"
        }
        actions={<PeriodSelector mode={mode} year={year} month={month} day={day} />}
      />
      {live && unclassifiedCount > 0 && (
        <div className="rounded-xl border border-[var(--pink-200)] bg-[var(--pink-50)] px-4 py-3 text-sm text-[var(--pink-700)]">
          {unclassifiedCount} facturi din Oblio nu au putut fi încadrate automat pe platformă și nu apar mai
          sus.
        </div>
      )}
      <FacturiIncasariClient platformRows={platformRows} />
    </div>
  );
}
