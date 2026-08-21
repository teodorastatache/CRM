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
    const raw = await fetchOblioInvoicesRaw();
    return NextResponse.json({ ok: true, raw });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
