import { NextResponse } from "next/server";
import {
  classifyMentions,
  classifyOblioInvoice,
  fetchAllOblioInvoices,
  isOblioConfigured,
  mapWithConcurrency,
  type OblioInvoicePlatform,
} from "@/lib/oblio-api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function emptyPlatformRecord<T>(fill: () => T): Record<OblioInvoicePlatform, T> {
  return {
    emag: fill(),
    trendyol: fill(),
    site: fill(),
    fulfillment: fill(),
    "call-center": fill(),
    altele: fill(),
  };
}

export async function GET(request: Request) {
  if (!isOblioConfigured()) {
    return NextResponse.json(
      { error: "Lipsesc OBLIO_EMAIL, OBLIO_SECRET sau OBLIO_CIF din variabilele de mediu." },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = Number(searchParams.get("year")) || now.getUTCFullYear();
    const month = Math.min(12, Math.max(1, Number(searchParams.get("month")) || now.getUTCMonth() + 1));

    // Aceeași regulă ca pagina reală: mereu ultima zi a lunii — Oblio pur și
    // simplu nu întoarce facturi din viitor pentru luna curentă.
    const issuedAfter = `${year}-${pad(month)}-01`;
    const issuedBefore = `${year}-${pad(month)}-${pad(lastDayOfMonth(year, month))}`;

    const result = await fetchAllOblioInvoices(issuedAfter, issuedBefore);
    if (!result) {
      return NextResponse.json(
        { error: "Lipsesc OBLIO_EMAIL, OBLIO_SECRET sau OBLIO_CIF din variabilele de mediu." },
        { status: 500 }
      );
    }

    const active = result.invoices.filter((inv) => inv.canceled !== "1" && inv.draft !== "1");
    const activeTotalSum = active.reduce((sum, inv) => sum + Number(inv.total), 0);

    const platformCountsAfterMentions = emptyPlatformRecord(() => 0);
    const platformSumsAfterMentions = emptyPlatformRecord(() => 0);
    const unclassifiedAfterMentions: typeof active = [];

    for (const inv of active) {
      const platform = classifyMentions(inv.mentions ?? "");
      platformCountsAfterMentions[platform] += 1;
      platformSumsAfterMentions[platform] += Number(inv.total);
      if (platform === "altele") unclassifiedAfterMentions.push(inv);
    }

    const pdfResults = await mapWithConcurrency(unclassifiedAfterMentions, 8, async (inv) => {
      const id = `${inv.seriesName}${inv.number}`;
      const clientName = inv.client?.name ?? "(fără nume client)";
      const total = Number(inv.total);
      try {
        const platform = await classifyOblioInvoice({
          mentions: inv.mentions ?? "",
          total,
          clientName,
          link: inv.link,
        });
        return { id, clientName, total, hasLink: Boolean(inv.link), platform, error: null };
      } catch (err) {
        return {
          id,
          clientName,
          total,
          hasLink: Boolean(inv.link),
          platform: "altele" as OblioInvoicePlatform,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    const platformCountsAfterPdf: Record<OblioInvoicePlatform, number> = { ...platformCountsAfterMentions };
    const platformSumsAfterPdf: Record<OblioInvoicePlatform, number> = { ...platformSumsAfterMentions };
    platformCountsAfterPdf.altele = 0;
    platformSumsAfterPdf.altele = 0;
    for (const r of pdfResults) {
      platformCountsAfterPdf[r.platform] += 1;
      platformSumsAfterPdf[r.platform] += r.total;
    }

    return NextResponse.json({
      ok: true,
      year,
      month,
      issuedAfter,
      issuedBefore,
      totalScanned: result.totalScanned,
      duplicatesSkipped: result.duplicatesSkipped,
      hitPageCap: result.hitPageCap,
      timedOut: result.timedOut,
      activeTotalSum,
      pageErrors: result.pageErrors,
      platformCountsAfterMentions,
      platformSumsAfterMentions,
      unclassifiedAfterMentionsCount: unclassifiedAfterMentions.length,
      platformCountsAfterPdf,
      platformSumsAfterPdf,
      pdfResults,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
