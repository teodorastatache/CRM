const EMAG_BASE = "https://marketplace-api.emag.ro/api-3";
const PAGE_SIZE = 100;

// Statusuri excluse din calculul vânzărilor — anulate/returnate.
// 1=New, 2=In progress, 3=Prepared, 4=Finalized sunt considerate vânzări valide.
const EXCLUDED_ORDER_STATUSES = new Set([0, 5]);

export type EmagOrderStats = {
  yesterdayRevenue: number;
  yesterdayOrders: number;
  monthRevenue: number;
  monthOrders: number;
};

type EmagOrderProduct = {
  status?: number;
  sale_price?: number;
  quantity?: number;
};

type EmagOrder = {
  id?: number;
  status?: number;
  shipping_tax?: number;
  products?: EmagOrderProduct[];
};

type EmagApiResponse = {
  isError: boolean;
  messages?: string[];
  results?: EmagOrder[];
};

function getCredentials() {
  const username = process.env.EMAG_USERNAME;
  const password = process.env.EMAG_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}

export function isEmagConfigured(): boolean {
  return getCredentials() !== null;
}

function formatEmagDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(
    date.getUTCHours()
  )}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function orderRevenue(order: EmagOrder): number {
  const productsTotal = (order.products ?? [])
    .filter((p) => p.status === 1)
    .reduce((sum, p) => sum + (p.sale_price ?? 0) * (p.quantity ?? 0), 0);
  return productsTotal + (order.shipping_tax ?? 0);
}

async function fetchOrdersInRange(
  authHeader: string,
  from: Date,
  to: Date
): Promise<{ revenue: number; orders: number }> {
  let revenue = 0;
  let orders = 0;

  for (let page = 1; page <= 25; page++) {
    const res = await fetch(`${EMAG_BASE}/order/read`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        createdAfter: formatEmagDate(from),
        createdBefore: formatEmagDate(to),
        currentPage: page,
        itemsPerPage: PAGE_SIZE,
      }),
    });

    if (!res.ok) {
      throw new Error(`eMAG API a răspuns cu status ${res.status}`);
    }

    const json = (await res.json()) as EmagApiResponse;
    if (json.isError) {
      throw new Error(`eMAG API a returnat eroare: ${(json.messages ?? []).join(", ")}`);
    }

    const results = json.results ?? [];
    for (const order of results) {
      if (order.status !== undefined && EXCLUDED_ORDER_STATUSES.has(order.status)) continue;
      revenue += orderRevenue(order);
      orders += 1;
    }

    if (results.length < PAGE_SIZE) break;
  }

  return { revenue, orders };
}

export async function getEmagOrderStats(): Promise<EmagOrderStats | null> {
  const credentials = getCredentials();
  if (!credentials) return null;

  const authHeader =
    "Basic " + Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setUTCDate(startOfYesterday.getUTCDate() - 1);
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [yesterday, month] = await Promise.all([
    fetchOrdersInRange(authHeader, startOfYesterday, startOfToday),
    fetchOrdersInRange(authHeader, startOfMonth, startOfToday),
  ]);

  return {
    yesterdayRevenue: yesterday.revenue,
    yesterdayOrders: yesterday.orders,
    monthRevenue: month.revenue,
    monthOrders: month.orders,
  };
}
