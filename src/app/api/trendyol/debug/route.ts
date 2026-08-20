import { NextResponse } from "next/server";
import { getTrendyolOrderStats, debugTrendyolMonthOrders } from "@/lib/trendyol-api";

const TRENDYOL_BASE = "https://apigw.trendyol.com/integration/order/sellers";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.TRENDYOL_API_KEY;
  const apiSecret = process.env.TRENDYOL_API_SECRET;
  const sellerId = process.env.TRENDYOL_SELLER_ID;

  if (!apiKey || !apiSecret || !sellerId) {
    return NextResponse.json({ error: "Lipsesc credențialele Trendyol." }, { status: 500 });
  }

  const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const now = new Date();
  const startOfMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const url = new URL(`${TRENDYOL_BASE}/${sellerId}/orders`);
  url.searchParams.set("startDate", String(startOfMonth));
  url.searchParams.set("endDate", String(startOfToday));
  url.searchParams.set("page", "0");
  url.searchParams.set("size", "200");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Authorization: authHeader,
      "User-Agent": `${sellerId} - SelfIntegration`,
    },
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Răspuns non-JSON de la Trendyol", status: res.status, body: text.slice(0, 2000) },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json({ error: "Trendyol a răspuns cu eroare", status: res.status, body: json }, { status: 502 });
  }

  const data = json as {
    content?: Record<string, unknown>[];
    totalElements?: number;
    totalPages?: number;
  };
  const content = data.content ?? [];

  const statusCounts: Record<string, number> = {};
  for (const order of content) {
    const status = String(order.status ?? order.shipmentPackageStatus ?? "necunoscut");
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;
  }

  const sampleOrders = content.slice(0, 3).map((order) => ({
    orderNumber: order.orderNumber,
    status: order.status,
    shipmentPackageStatus: order.shipmentPackageStatus,
    grossAmount: order.grossAmount,
    totalPrice: order.totalPrice,
    totalDiscount: order.totalDiscount,
    allKeys: Object.keys(order),
  }));

  let productionStats: unknown;
  let productionError: string | null = null;
  try {
    productionStats = await getTrendyolOrderStats();
  } catch (err) {
    productionError = err instanceof Error ? err.message : String(err);
  }

  let perOrderDecisions: unknown;
  let decisionsError: string | null = null;
  try {
    perOrderDecisions = await debugTrendyolMonthOrders();
  } catch (err) {
    decisionsError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    requestWindow: { startOfMonth: new Date(startOfMonth).toISOString(), startOfToday: new Date(startOfToday).toISOString() },
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    fetchedThisPage: content.length,
    statusCounts,
    sampleOrders,
    productionStats,
    productionError,
    perOrderDecisions,
    decisionsError,
  });
}
