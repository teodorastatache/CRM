import { CheckCircle2, Plug } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/section-card";

export const dynamic = "force-dynamic";

export default async function IntegrariPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string }>;
}) {
  const { connected } = await searchParams;
  const shopify = await prisma.integration.findUnique({ where: { provider: "shopify" } });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)]">Integrări</h1>
        <p className="text-sm text-[var(--muted)]">
          Conectează platformele de vânzări și facturare pentru date reale în Dashboard.
        </p>
      </div>

      {connected === "shopify" && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--pink-200)] bg-[var(--pink-50)] px-4 py-3 text-sm font-semibold text-[var(--pink-700)]">
          <CheckCircle2 size={16} />
          Shopify conectat cu succes.
        </div>
      )}

      <SectionCard title="Shopify" icon={Plug}>
        {shopify ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Conectat la {shopify.shopDomain}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Scopuri: {shopify.scope} · actualizat{" "}
                {new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium", timeStyle: "short" }).format(
                  shopify.updatedAt
                )}
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full navigation to an OAuth-redirecting API route, not an app page */}
            <a
              href="/api/shopify/install"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--pink-50)]"
            >
              Reconectează
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">
              Nu e conectat încă. Datele din Dashboard rămân demonstrative (mock) până conectezi.
            </p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full navigation to an OAuth-redirecting API route, not an app page */}
            <a
              href="/api/shopify/install"
              className="shrink-0 rounded-lg bg-gradient-to-r from-[var(--pink-500)] to-[var(--pink-600)] px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              Conectează Shopify
            </a>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
