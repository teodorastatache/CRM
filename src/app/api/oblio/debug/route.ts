import { NextResponse } from "next/server";
import { getOblioToken, isOblioConfigured } from "@/lib/oblio-api";

export const dynamic = "force-dynamic";

const OBLIO_BASE = "https://www.oblio.eu/api";

type RawInvoice = { seriesName: string; number: string; mentions?: string };
type RawListResponse = { status: number; data?: RawInvoice[] };

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
    let candidate: RawInvoice | undefined;
    let totalScanned = 0;

    for (let page = 0; page < 20 && !candidate; page++) {
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
      const data = raw.data ?? [];
      totalScanned += data.length;

      candidate = data.find((inv) => {
        const m = (inv.mentions ?? "").toLowerCase();
        return !m.includes("emag") && !m.includes("trendyol") && !m.includes("infiniteea");
      });

      if (data.length < limit) break;
    }

    let sampleDetail: unknown = null;
    if (candidate) {
      const detailUrl = new URL(`${OBLIO_BASE}/docs/invoice`);
      detailUrl.searchParams.set("cif", cif);
      detailUrl.searchParams.set("seriesName", candidate.seriesName);
      detailUrl.searchParams.set("number", candidate.number);
      const detailRes = await fetch(detailUrl.toString(), {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      sampleDetail = await detailRes.json();
    }

    return NextResponse.json({
      ok: true,
      totalScanned,
      candidateMentions: candidate?.mentions,
      sampleDetail,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
