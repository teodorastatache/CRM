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

export async function GET() {
  if (!isOblioConfigured()) {
    return NextResponse.json(
      { error: "Lipsesc OBLIO_EMAIL, OBLIO_SECRET sau OBLIO_CIF din variabilele de mediu." },
      { status: 500 }
    );
  }

  try {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const startOfMonth = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-01`;
    const today = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;

    const result = await fetchAllOblioInvoices(startOfMonth, today);
    if (!result) {
      return NextResponse.json(
        { error: "Lipsesc OBLIO_EMAIL, OBLIO_SECRET sau OBLIO_CIF din variabilele de mediu." },
        { status: 500 }
      );
    }

    const active = result.invoices.filter((inv) => inv.canceled !== "1" && inv.draft !== "1");
    const activeTotalSum = active.reduce((sum, inv) => sum + Number(inv.total), 0);

    const platformCountsAfterMentions: Record<OblioInvoicePlatform, number> = {
      emag: 0,
      trendyol: 0,
      site: 0,
      fulfillment: 0,
      "call-center": 0,
      altele: 0,
    };
    const unclassifiedAfterMentions = active.filter((inv) => {
      const platform = classifyMentions(inv.mentions ?? "");
      platformCountsAfterMentions[platform] += 1;
      return platform === "altele";
    });

    const pdfResults = await mapWithConcurrency(unclassifiedAfterMentions, 8, async (inv) => {
      const id = `${inv.seriesName}${inv.number}`;
      const clientName = inv.client?.name ?? "(fără nume client)";
      try {
        const platform = await classifyOblioInvoice({
          mentions: inv.mentions ?? "",
          total: Number(inv.total),
          clientName,
          link: inv.link,
        });
        return { id, clientName, hasLink: Boolean(inv.link), platform, error: null };
      } catch (err) {
        return {
          id,
          clientName,
          hasLink: Boolean(inv.link),
          platform: "altele" as OblioInvoicePlatform,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    const platformCountsAfterPdf: Record<OblioInvoicePlatform, number> = { ...platformCountsAfterMentions };
    platformCountsAfterPdf.altele = 0;
    for (const r of pdfResults) {
      if (r.platform !== "altele") {
        platformCountsAfterPdf[r.platform] += 1;
      } else {
        platformCountsAfterPdf.altele += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      totalScanned: result.totalScanned,
      duplicatesSkipped: result.duplicatesSkipped,
      hitPageCap: result.hitPageCap,
      timedOut: result.timedOut,
      activeTotalSum,
      pageErrors: result.pageErrors,
      platformCountsAfterMentions,
      unclassifiedAfterMentionsCount: unclassifiedAfterMentions.length,
      platformCountsAfterPdf,
      pdfResults,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
