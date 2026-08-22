import { NextResponse } from "next/server";
import {
  classifyByInvoicePdf,
  classifyMentions,
  getOblioToken,
  isOblioConfigured,
  type OblioInvoicePlatform,
} from "@/lib/oblio-api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const OBLIO_BASE = "https://www.oblio.eu/api";

type RawInvoice = {
  seriesName: string;
  number: string;
  mentions?: string;
  link?: string;
  client?: { name?: string };
};
type RawListResponse = { status: number; statusMessage?: string; data?: RawInvoice[] };

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

    const token = await getOblioToken();
    const cif = process.env.OBLIO_CIF!;
    const limit = 100;
    let totalScanned = 0;

    const unclassifiedAfterMentions: RawInvoice[] = [];
    const platformCountsAfterMentions: Record<OblioInvoicePlatform, number> = {
      emag: 0,
      trendyol: 0,
      site: 0,
      fulfillment: 0,
      "call-center": 0,
      altele: 0,
    };

    const pageErrors: { page: number; status?: number; statusMessage?: string }[] = [];

    for (let page = 0; page < 20; page++) {
      if (page > 0) await new Promise((resolve) => setTimeout(resolve, 200));
      const url = new URL(`${OBLIO_BASE}/docs/invoice/list`);
      url.searchParams.set("cif", cif);
      url.searchParams.set("issuedAfter", startOfMonth);
      url.searchParams.set("issuedBefore", today);
      url.searchParams.set("limitPerPage", String(limit));
      url.searchParams.set("offset", String(page * limit));
      url.searchParams.set("orderBy", "id");
      url.searchParams.set("orderDir", "desc");

      const res = await fetch(url.toString(), {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const raw = (await res.json()) as RawListResponse;

      if (raw.status !== 200) {
        pageErrors.push({ page, status: raw.status, statusMessage: raw.statusMessage });
        break;
      }

      const data = raw.data ?? [];
      totalScanned += data.length;

      for (const inv of data) {
        const platform = classifyMentions(inv.mentions ?? "");
        platformCountsAfterMentions[platform] += 1;
        if (platform === "altele") unclassifiedAfterMentions.push(inv);
      }

      if (data.length < limit) break;
    }

    const pdfResults: {
      id: string;
      clientName: string;
      hasLink: boolean;
      platform: OblioInvoicePlatform;
      error: string | null;
    }[] = [];

    for (const inv of unclassifiedAfterMentions) {
      const id = `${inv.seriesName}${inv.number}`;
      const clientName = inv.client?.name ?? "(fără nume client)";
      if (!inv.link) {
        pdfResults.push({ id, clientName, hasLink: false, platform: "altele", error: null });
        continue;
      }
      try {
        const platform = await classifyByInvoicePdf(inv.link);
        pdfResults.push({ id, clientName, hasLink: true, platform, error: null });
      } catch (err) {
        pdfResults.push({
          id,
          clientName,
          hasLink: true,
          platform: "altele",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

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
      totalScanned,
      pageErrors,
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
