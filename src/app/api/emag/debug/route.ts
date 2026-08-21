import { NextResponse } from "next/server";
import { getEmagOrderStats } from "@/lib/emag-api";

const EMAG_BASE = "https://marketplace-api.emag.ro/api-3";

export const dynamic = "force-dynamic";

export async function GET() {
  const username = process.env.EMAG_USERNAME;
  const password = process.env.EMAG_PASSWORD;

  if (!username || !password) {
    return NextResponse.json({ error: "Lipsesc EMAG_USERNAME sau EMAG_PASSWORD." }, { status: 500 });
  }

  const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const startOfMonth = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-01 00:00:00`;
  const today = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} 00:00:00`;

  let rawStatus: number | null = null;
  let rawBody: unknown = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(`${EMAG_BASE}/order/read`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        createdAfter: startOfMonth,
        createdBefore: today,
        currentPage: 1,
        itemsPerPage: 5,
      }),
    });
    rawStatus = res.status;
    const text = await res.text();
    try {
      rawBody = JSON.parse(text);
    } catch {
      rawBody = text.slice(0, 2000);
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err);
  }

  let productionStats: unknown;
  let productionError: string | null = null;
  try {
    productionStats = await getEmagOrderStats();
  } catch (err) {
    productionError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    requestWindow: { startOfMonth, today },
    rawStatus,
    rawBody,
    fetchError,
    productionStats,
    productionError,
  });
}
