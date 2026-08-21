import { NextResponse } from "next/server";
import { fetchOblioInvoicesRaw, isOblioConfigured } from "@/lib/oblio-api";

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

    const raw = await fetchOblioInvoicesRaw({
      issuedAfter: startOfMonth,
      issuedBefore: today,
      limitPerPage: "20",
      orderBy: "id",
      orderDir: "desc",
    });
    return NextResponse.json({ ok: true, raw });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
