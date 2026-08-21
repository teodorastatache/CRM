import { PageHeader } from "@/components/ui/page-header";
import { platformIncasari as mockPlatformIncasari, type IncasariRow, type PlatformaIncasari } from "@/lib/mock/financiar";
import { getOblioInvoiceSummaries } from "@/lib/oblio-api";
import { FacturiIncasariClient } from "./client";

export const dynamic = "force-dynamic";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default async function FacturiIncasariPage() {
  const now = new Date();
  const issuedAfter = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-01`;
  const issuedBefore = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;

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
            ? "Date reale din Oblio · luna curentă"
            : "Încasări eMAG, Trendyol, site, fulfillment și call center (date demonstrative)"
        }
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
