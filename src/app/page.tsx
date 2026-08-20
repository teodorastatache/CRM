import {
  Wallet,
  ShoppingCart,
  TrendingUp,
  Star,
  ListChecks,
  AlertTriangle,
  PackageX,
  ReceiptText,
  Gift,
  Headset,
} from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { formatCurrency, formatPercent, formatDate } from "@/lib/format";
import {
  mockPlatformSales,
  buildSalesSummary,
  buildProfitSummary,
  reviewsSummary,
  listingsSummary,
  stockAlerts,
  overdueInvoices,
  pulseToday,
  type PlatformSales,
} from "@/lib/mock-data";
import { getShopifyOrderStats } from "@/lib/shopify-api";
import { getTrendyolOrderStats } from "@/lib/trendyol-api";
import { getEmagOrderStats } from "@/lib/emag-api";

export const dynamic = "force-dynamic";

const today = new Intl.DateTimeFormat("ro-RO", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());

function applyLiveStats(
  platformSales: PlatformSales[],
  key: PlatformSales["key"],
  stats: { yesterdayRevenue: number; yesterdayOrders: number; monthRevenue: number; monthOrders: number }
) {
  const row = platformSales.find((p) => p.key === key);
  if (!row) return;
  row.yesterdayRevenue = stats.yesterdayRevenue;
  row.yesterdayOrders = stats.yesterdayOrders;
  row.monthRevenue = stats.monthRevenue;
  row.monthOrders = stats.monthOrders;
}

export default async function DashboardPage() {
  const platformSales: PlatformSales[] = mockPlatformSales.map((p) => ({ ...p }));
  const liveSources: string[] = [];
  const mockSources: string[] = [];

  try {
    const shopifyStats = await getShopifyOrderStats();
    if (shopifyStats) {
      applyLiveStats(platformSales, "shopify", shopifyStats);
      liveSources.push("Shopify");
    } else {
      mockSources.push("Shopify");
    }
  } catch {
    mockSources.push("Shopify");
  }

  try {
    const trendyolStats = await getTrendyolOrderStats();
    if (trendyolStats) {
      applyLiveStats(platformSales, "trendyol", trendyolStats);
      liveSources.push("Trendyol");
    } else {
      mockSources.push("Trendyol");
    }
  } catch {
    mockSources.push("Trendyol");
  }

  try {
    const emagStats = await getEmagOrderStats();
    if (emagStats) {
      applyLiveStats(platformSales, "emag", emagStats);
      liveSources.push("eMAG");
    } else {
      mockSources.push("eMAG");
    }
  } catch {
    mockSources.push("eMAG");
  }

  const salesSummary = buildSalesSummary(platformSales);
  const profitSummary = buildProfitSummary(salesSummary);
  const maxMonthRevenue = Math.max(...platformSales.map((p) => p.monthRevenue));
  const reviewsProgress = Math.min(
    1,
    (reviewsSummary.ownBrand + reviewsSummary.otherClients) / reviewsSummary.target
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--foreground)]">
            Bună, Teodora 👋
          </h1>
          <p className="text-sm capitalize text-[var(--muted)]">{today} · Sumar executiv</p>
        </div>
        <span className="rounded-full border border-[var(--pink-200)] bg-[var(--pink-50)] px-4 py-1.5 text-xs font-semibold text-[var(--pink-600)]">
          {liveSources.length > 0
            ? `Live: ${liveSources.join(", ")} · mock: ${mockSources.join(", ")}`
            : "Date demonstrative (mock)"}
        </span>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Vânzări ieri"
          value={`${formatCurrency(salesSummary.yesterdayRevenue)}`}
          suffix="lei"
          sublabel={`${salesSummary.yesterdayOrders} comenzi`}
          icon={ShoppingCart}
          tone="dark"
        />
        <KpiCard
          label="Vânzări luna curentă"
          value={`${formatCurrency(salesSummary.monthRevenue)}`}
          suffix="lei"
          sublabel={`${salesSummary.monthOrders} comenzi`}
          icon={TrendingUp}
        />
        <KpiCard
          label="Profit zilnic"
          value={`${formatCurrency(profitSummary.daily.profit)}`}
          suffix="lei"
          sublabel={`marjă ${formatPercent(profitSummary.daily.margin)}`}
          icon={Wallet}
        />
        <KpiCard
          label="Profit lunar"
          value={`${formatCurrency(profitSummary.monthly.profit)}`}
          suffix="lei"
          sublabel={`marjă ${formatPercent(profitSummary.monthly.margin)}`}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Platform breakdown */}
        <SectionCard title="Vânzări pe platformă" icon={ShoppingCart} className="xl:col-span-2">
          <div className="flex flex-col gap-5">
            {platformSales.map((platform) => (
              <div key={platform.key}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-[var(--foreground)]">{platform.label}</span>
                  <span className="text-[var(--muted)]">
                    Ieri:{" "}
                    <strong className="text-[var(--foreground)]">
                      {formatCurrency(platform.yesterdayRevenue)} lei
                    </strong>{" "}
                    · {platform.yesterdayOrders} comenzi
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--pink-50)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(platform.monthRevenue / maxMonthRevenue) * 100}%`,
                      backgroundColor: platform.color,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-[var(--muted)]">
                  <span>Lună curentă</span>
                  <span>
                    {formatCurrency(platform.monthRevenue)} lei · {platform.monthOrders} comenzi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Reviews & listings */}
        <SectionCard title="Recenzii & listări" icon={Star}>
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--pink-50)] p-3 text-center">
              <p className="text-xl font-extrabold text-[var(--pink-700)]">{reviewsSummary.ownBrand}</p>
              <p className="text-xs text-[var(--muted)]">recenzii firmă proprie</p>
            </div>
            <div className="rounded-xl bg-[var(--pink-50)] p-3 text-center">
              <p className="text-xl font-extrabold text-[var(--pink-700)]">{reviewsSummary.otherClients}</p>
              <p className="text-xs text-[var(--muted)]">recenzii alți clienți</p>
            </div>
          </div>
          <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
            <span>Progres țintă lunară recenzii</span>
            <span>
              {reviewsSummary.ownBrand + reviewsSummary.otherClients} / {reviewsSummary.target}
            </span>
          </div>
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[var(--pink-50)]">
            <div
              className="h-full rounded-full bg-[var(--pink-500)]"
              style={{ width: `${reviewsProgress * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <ListChecks size={16} className="text-[var(--pink-600)]" />
              Listări realizate azi
            </div>
            <span className="text-sm font-bold text-[var(--foreground)]">
              {listingsSummary.today}/{listingsSummary.target}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3">
            <span className="text-sm text-[var(--foreground)]">Listări luna curentă</span>
            <span className="text-sm font-bold text-[var(--foreground)]">{listingsSummary.month}</span>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Puls azi */}
        <SectionCard title="Puls azi · Ce s-a mișcat în companie" icon={TrendingUp}>
          <div className="grid grid-cols-2 gap-3">
            <PulseTile icon={Star} value={pulseToday.reviewsConfirmed} label="recenzii confirmate" />
            <PulseTile icon={ListChecks} value={pulseToday.listingsDone} label="listări realizate" />
            <PulseTile icon={Gift} value={pulseToday.giftsSent} label="cadouri trimise" />
            <PulseTile icon={Headset} value={pulseToday.supportResolved} label="cereri suport rezolvate" />
          </div>
        </SectionCard>

        {/* Stock alerts */}
        <SectionCard title="Alerte stocuri critice" icon={PackageX}>
          <div className="flex flex-col gap-2.5">
            {stockAlerts.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--pink-100)] bg-[var(--pink-50)] px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {item.product}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.sku} · stoc {item.stock} buc · {item.avgDailySales}/zi
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--pink-600)] px-3 py-1 text-xs font-bold text-white">
                  {item.daysLeft} zile
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Overdue invoices */}
        <SectionCard title="Facturi întârziate" icon={ReceiptText}>
          <div className="flex flex-col gap-2.5">
            {overdueInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {invoice.supplier}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {invoice.id} · scadent {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-[var(--foreground)]">
                    {formatCurrency(invoice.amount)} lei
                  </p>
                  <p className="flex items-center justify-end gap-1 text-xs font-semibold text-[var(--pink-600)]">
                    <AlertTriangle size={11} />
                    {invoice.daysOverdue} zile întârziere
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function PulseTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Star;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[var(--pink-50)] px-3 py-4 text-center">
      <Icon size={18} className="text-[var(--pink-600)]" />
      <p className="text-xl font-extrabold text-[var(--foreground)]">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
