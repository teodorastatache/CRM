import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOblioConfigured } from "@/lib/oblio-api";
import { syncOblioMonth } from "@/lib/oblio-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Contul Hobby de Vercel permite cron doar o dată pe zi, deci sincronizăm
// o singură lună pe rulare — cea mai "învechită" din anul curent (nesincronizată
// niciodată = cea mai veche posibil). Așa, istoricul anului se completează
// treptat, o lună pe zi, iar odată prins din urmă, fiecare lună (inclusiv cea
// curentă) se reîmprospătează pe rând, o dată la ~N zile.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isOblioConfigured()) {
    return NextResponse.json({ ok: false, error: "Oblio nu este configurat." }, { status: 500 });
  }

  try {
    const now = new Date();
    const year = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1;

    const existing = await prisma.oblioMonthlyTotal.findMany({
      where: { year, month: { lte: currentMonth } },
      select: { month: true, lastSyncedAt: true },
    });

    const oldestSyncByMonth = new Map<number, Date>();
    for (const row of existing) {
      const prev = oldestSyncByMonth.get(row.month);
      if (!prev || row.lastSyncedAt < prev) oldestSyncByMonth.set(row.month, row.lastSyncedAt);
    }

    let targetMonth = currentMonth;
    let oldestTime = oldestSyncByMonth.get(currentMonth) ?? new Date(0);
    for (let m = 1; m <= currentMonth; m++) {
      const t = oldestSyncByMonth.get(m) ?? new Date(0);
      if (t < oldestTime) {
        oldestTime = t;
        targetMonth = m;
      }
    }

    const result = await syncOblioMonth(year, targetMonth);

    return NextResponse.json({ ok: true, year, month: targetMonth, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
