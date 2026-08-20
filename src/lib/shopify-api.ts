import { prisma } from "@/lib/prisma";

const API_VERSION = "2025-10";

export type ShopifyOrderStats = {
  yesterdayRevenue: number;
  yesterdayOrders: number;
  monthRevenue: number;
  monthOrders: number;
};

type OrderEdge = {
  node: { id: string; currentTotalPriceSet: { shopMoney: { amount: string } } };
};

type OrdersResponse = {
  data?: {
    orders: {
      edges: OrderEdge[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
  errors?: unknown;
};

async function fetchOrdersInRange(
  shopDomain: string,
  accessToken: string,
  fromIso: string,
  toIso: string
): Promise<{ revenue: number; orders: number }> {
  const query = `created_at:>='${fromIso}' created_at:<'${toIso}'`;
  let revenue = 0;
  let orders = 0;
  let cursor: string | null = null;

  for (let page = 0; page < 20; page++) {
    const body = {
      query: `
        query OrdersInRange($query: String!, $after: String) {
          orders(first: 250, query: $query, after: $after) {
            edges { node { id currentTotalPriceSet { shopMoney { amount } } } }
            pageInfo { hasNextPage endCursor }
          }
        }
      `,
      variables: { query, after: cursor },
    };

    const res = await fetch(`https://${shopDomain}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Shopify API a răspuns cu status ${res.status}`);
    }

    const json = (await res.json()) as OrdersResponse;
    if (json.errors || !json.data) {
      throw new Error("Shopify GraphQL a returnat o eroare.");
    }

    for (const edge of json.data.orders.edges) {
      revenue += Number(edge.node.currentTotalPriceSet.shopMoney.amount);
      orders += 1;
    }

    if (!json.data.orders.pageInfo.hasNextPage) break;
    cursor = json.data.orders.pageInfo.endCursor;
  }

  return { revenue, orders };
}

export async function getShopifyOrderStats(): Promise<ShopifyOrderStats | null> {
  const integration = await prisma.integration.findUnique({ where: { provider: "shopify" } });
  if (!integration) return null;

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setUTCDate(startOfYesterday.getUTCDate() - 1);
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [yesterday, month] = await Promise.all([
    fetchOrdersInRange(
      integration.shopDomain!,
      integration.accessToken,
      startOfYesterday.toISOString(),
      startOfToday.toISOString()
    ),
    fetchOrdersInRange(
      integration.shopDomain!,
      integration.accessToken,
      startOfMonth.toISOString(),
      startOfToday.toISOString()
    ),
  ]);

  return {
    yesterdayRevenue: yesterday.revenue,
    yesterdayOrders: yesterday.orders,
    monthRevenue: month.revenue,
    monthOrders: month.orders,
  };
}
