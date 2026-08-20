export type PlatformKey = "shopify" | "emag" | "trendyol";

export type PlatformSales = {
  key: PlatformKey;
  label: string;
  color: string;
  yesterdayRevenue: number;
  yesterdayOrders: number;
  monthRevenue: number;
  monthOrders: number;
};

export const mockPlatformSales: PlatformSales[] = [
  {
    key: "shopify",
    label: "Site (Shopify)",
    color: "var(--pink-500)",
    yesterdayRevenue: 8420,
    yesterdayOrders: 46,
    monthRevenue: 118340,
    monthOrders: 642,
  },
  {
    key: "emag",
    label: "eMAG Marketplace",
    color: "var(--pink-400)",
    yesterdayRevenue: 14680,
    yesterdayOrders: 91,
    monthRevenue: 201750,
    monthOrders: 1284,
  },
  {
    key: "trendyol",
    label: "Trendyol",
    color: "var(--pink-300)",
    yesterdayRevenue: 2150,
    yesterdayOrders: 13,
    monthRevenue: 27430,
    monthOrders: 176,
  },
];

export function buildSalesSummary(platformSales: PlatformSales[]) {
  return {
    yesterdayRevenue: platformSales.reduce((sum, p) => sum + p.yesterdayRevenue, 0),
    yesterdayOrders: platformSales.reduce((sum, p) => sum + p.yesterdayOrders, 0),
    monthRevenue: platformSales.reduce((sum, p) => sum + p.monthRevenue, 0),
    monthOrders: platformSales.reduce((sum, p) => sum + p.monthOrders, 0),
  };
}

// Cost/opex sunt încă estimate (procente aplicate la venit) până conectăm o sursă
// reală de costuri (marfă, cheltuieli operaționale) — deocamdată doar veniturile
// pot fi reale (din Shopify).
const COGS_RATIO = 0.58;
const OPEX_RATIO = 0.13;

function buildProfitBucket(revenue: number) {
  const cogs = Math.round(revenue * COGS_RATIO);
  const opex = Math.round(revenue * OPEX_RATIO);
  const profit = revenue - cogs - opex;
  return {
    revenue,
    cogs,
    opex,
    profit,
    margin: revenue > 0 ? profit / revenue : 0,
  };
}

export function buildProfitSummary(salesSummary: {
  yesterdayRevenue: number;
  monthRevenue: number;
}) {
  return {
    daily: buildProfitBucket(salesSummary.yesterdayRevenue),
    monthly: buildProfitBucket(salesSummary.monthRevenue),
  };
}

export type ReviewsSummary = {
  ownBrand: number;
  otherClients: number;
  target: number;
};

export const reviewsSummary: ReviewsSummary = {
  ownBrand: 18,
  otherClients: 27,
  target: 50,
};

export const listingsSummary = {
  today: 9,
  month: 164,
  target: 10,
};

export type StockAlert = {
  sku: string;
  product: string;
  daysLeft: number;
  stock: number;
  avgDailySales: number;
};

export const stockAlerts: StockAlert[] = [
  { sku: "PXM-0231", product: "Covor mată yoga premium 6mm roz", daysLeft: 2, stock: 14, avgDailySales: 6.2 },
  { sku: "PXM-0118", product: "Set benzi elastice fitness 5 buc", daysLeft: 4, stock: 31, avgDailySales: 7.8 },
  { sku: "PXM-0304", product: "Saltea gimnastică pliabilă 180cm", daysLeft: 5, stock: 9, avgDailySales: 1.9 },
  { sku: "PXM-0092", product: "Minge fitness anti-explozie 65cm", daysLeft: 6, stock: 22, avgDailySales: 3.6 },
];

export type OverdueInvoice = {
  id: string;
  supplier: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
};

export const overdueInvoices: OverdueInvoice[] = [
  { id: "FV-2026-0417", supplier: "Furnizor ambalaje SRL", amount: 4230, dueDate: "2026-08-10", daysOverdue: 6 },
  { id: "FV-2026-0402", supplier: "Transport Cargo Partner", amount: 9870, dueDate: "2026-08-12", daysOverdue: 4 },
  { id: "FV-2026-0388", supplier: "Agenție Marketing DigitalUp", amount: 6500, dueDate: "2026-08-14", daysOverdue: 2 },
];

export const pulseToday = {
  reviewsConfirmed: 7,
  listingsDone: 9,
  giftsSent: 3,
  supportResolved: 12,
};
