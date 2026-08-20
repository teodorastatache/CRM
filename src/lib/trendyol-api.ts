const TRENDYOL_BASE = "https://apigw.trendyol.com/integration/order/sellers";
// Trendyol limitează intervalul de interogare a comenzilor la max. 15 zile —
// folosim 14 ca marjă de siguranță și împărțim intervalele mai lungi în bucăți.
const MAX_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const PAGE_SIZE = 200;

export type TrendyolOrderStats = {
  yesterdayRevenue: number;
  yesterdayOrders: number;
  monthRevenue: number;
  monthOrders: number;
};

type TrendyolOrder = {
  orderNumber?: string;
  grossAmount?: number;
  totalPrice?: number;
  status?: string;
  shipmentPackageStatus?: string;
};

type TrendyolOrdersResponse = {
  content: TrendyolOrder[];
  totalPages: number;
};

// Statusuri excluse din "vânzări nete" — anulate/nelivrate/returnate,
// la fel cum panoul Trendyol exclude aceste comenzi din "Net sales".
const EXCLUDED_STATUSES = new Set([
  "Cancelled",
  "UnDelivered",
  "UnDeliveredAndReturned",
  "Returned",
  "UnSupplied",
]);

function isCountedOrder(order: TrendyolOrder): boolean {
  const status = order.status ?? order.shipmentPackageStatus;
  if (!status) return true;
  return !EXCLUDED_STATUSES.has(status);
}

function getCredentials() {
  const apiKey = process.env.TRENDYOL_API_KEY;
  const apiSecret = process.env.TRENDYOL_API_SECRET;
  const sellerId = process.env.TRENDYOL_SELLER_ID;
  if (!apiKey || !apiSecret || !sellerId) return null;
  return { apiKey, apiSecret, sellerId };
}

export function isTrendyolConfigured(): boolean {
  return getCredentials() !== null;
}

async function fetchOrdersWindow(
  sellerId: string,
  authHeader: string,
  startMs: number,
  endMs: number
): Promise<{ revenue: number; orders: number }> {
  let revenue = 0;
  let orders = 0;

  for (let page = 0; page < 25; page++) {
    const url = new URL(`${TRENDYOL_BASE}/${sellerId}/orders`);
    url.searchParams.set("startDate", String(startMs));
    url.searchParams.set("endDate", String(endMs));
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(PAGE_SIZE));

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Authorization: authHeader,
        "User-Agent": `${sellerId} - SelfIntegration`,
      },
    });

    if (!res.ok) {
      throw new Error(`Trendyol API a răspuns cu status ${res.status}`);
    }

    const json = (await res.json()) as TrendyolOrdersResponse;
    for (const order of json.content ?? []) {
      if (!isCountedOrder(order)) continue;
      revenue += Number(order.grossAmount ?? order.totalPrice ?? 0);
      orders += 1;
    }

    if (page >= (json.totalPages ?? 1) - 1) break;
  }

  return { revenue, orders };
}

async function fetchOrdersInRange(
  sellerId: string,
  authHeader: string,
  fromMs: number,
  toMs: number
): Promise<{ revenue: number; orders: number }> {
  let revenue = 0;
  let orders = 0;
  let chunkStart = fromMs;

  while (chunkStart < toMs) {
    const chunkEnd = Math.min(chunkStart + MAX_WINDOW_MS, toMs);
    const chunk = await fetchOrdersWindow(sellerId, authHeader, chunkStart, chunkEnd);
    revenue += chunk.revenue;
    orders += chunk.orders;
    chunkStart = chunkEnd;
  }

  return { revenue, orders };
}

export async function debugTrendyolMonthOrders(): Promise<
  | {
      chunks: { startMs: number; endMs: number; orders: { orderNumber?: string; status?: string; shipmentPackageStatus?: string; counted: boolean }[] }[];
    }
  | null
> {
  const credentials = getCredentials();
  if (!credentials) return null;

  const authHeader =
    "Basic " + Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString("base64");

  const now = new Date();
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startOfMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

  const chunks: { startMs: number; endMs: number; orders: { orderNumber?: string; status?: string; shipmentPackageStatus?: string; counted: boolean }[] }[] = [];
  let chunkStart = startOfMonth;

  while (chunkStart < startOfToday) {
    const chunkEnd = Math.min(chunkStart + MAX_WINDOW_MS, startOfToday);
    const url = new URL(`${TRENDYOL_BASE}/${credentials.sellerId}/orders`);
    url.searchParams.set("startDate", String(chunkStart));
    url.searchParams.set("endDate", String(chunkEnd));
    url.searchParams.set("page", "0");
    url.searchParams.set("size", String(PAGE_SIZE));

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Authorization: authHeader,
        "User-Agent": `${credentials.sellerId} - SelfIntegration`,
      },
    });
    const json = (await res.json()) as TrendyolOrdersResponse;

    chunks.push({
      startMs: chunkStart,
      endMs: chunkEnd,
      orders: (json.content ?? []).map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        shipmentPackageStatus: o.shipmentPackageStatus,
        counted: isCountedOrder(o),
      })),
    });

    chunkStart = chunkEnd;
  }

  return { chunks };
}

export async function getTrendyolOrderStats(): Promise<TrendyolOrderStats | null> {
  const credentials = getCredentials();
  if (!credentials) return null;

  const authHeader =
    "Basic " + Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString("base64");

  const now = new Date();
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

  const [yesterday, month] = await Promise.all([
    fetchOrdersInRange(credentials.sellerId, authHeader, startOfYesterday, startOfToday),
    fetchOrdersInRange(credentials.sellerId, authHeader, startOfMonth, startOfToday),
  ]);

  return {
    yesterdayRevenue: yesterday.revenue,
    yesterdayOrders: yesterday.orders,
    monthRevenue: month.revenue,
    monthOrders: month.orders,
  };
}
