import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOblioConfigured } from "@/lib/oblio-api";
import { syncOblioMonth } from "@/lib/oblio-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Sincronizează o singură lună pe invocare, ca să rămânem în bugetul de timp
// al funcției serverless. Prioritizează luna curentă (cea mai activă); dacă
// aceasta a fost sincronizată recent, alege cea mai "învechită" lună anterioară
// din anul curent, astfel încât istoricul se completează treptat, pe parcursul
// mai multor rulări ale job-ului programat.
const CURRENT_MONTH_REFRESH_MS = 10 * 60 * 1000;

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

    const currentMonthLastSync = oldestSyncByMonth.get(currentMonth);
    let targetMonth = currentMonth;

    if (currentMonthLastSync && Date.now() - currentMonthLastSync.getTime() < CURRENT_MONTH_REFRESH_MS) {
      // Luna curentă e proaspătă — alegem cea mai învechită lună anterioară.
      let oldestTime = new Date();
      let found = false;
      for (let m = 1; m < currentMonth; m++) {
        const t = oldestSyncByMonth.get(m) ?? new Date(0);
        if (!found || t < oldestTime) {
          oldestTime = t;
          targetMonth = m;
          found = true;
        }
      }
      if (!found) targetMonth = currentMonth;
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
