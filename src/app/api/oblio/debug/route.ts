import { NextResponse } from "next/server";
import { fetchOblioInvoicesRaw, getOblioToken, isOblioConfigured } from "@/lib/oblio-api";

export const dynamic = "force-dynamic";

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

    const raw = (await fetchOblioInvoicesRaw({
      issuedAfter: startOfMonth,
      issuedBefore: today,
      limitPerPage: "50",
      orderBy: "id",
      orderDir: "desc",
    })) as { status: number; data?: { seriesName: string; number: string; mentions?: string }[] };

    const candidate = (raw.data ?? []).find((inv) => {
      const m = (inv.mentions ?? "").toLowerCase();
      return !m.includes("emag.ro") && !m.includes("trendyol") && !m.includes("infiniteea.ro");
    });

    let sampleDetail: unknown = null;
    if (candidate) {
      const token = await getOblioToken();
      const cif = process.env.OBLIO_CIF!;
      const detailUrl = new URL("https://www.oblio.eu/api/docs/invoice");
      detailUrl.searchParams.set("cif", cif);
      detailUrl.searchParams.set("seriesName", candidate.seriesName);
      detailUrl.searchParams.set("number", candidate.number);
      const detailRes = await fetch(detailUrl.toString(), {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      sampleDetail = await detailRes.json();
    }

    return NextResponse.json({ ok: true, raw, candidateMentions: candidate?.mentions, sampleDetail });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
