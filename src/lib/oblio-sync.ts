import { prisma } from "@/lib/prisma";
import {
  classifyOblioInvoice,
  fetchAllOblioInvoices,
  invoiceTotalRon,
  type OblioInvoicePlatform,
} from "@/lib/oblio-api";

const REAL_PLATFORMS = ["emag", "trendyol", "site", "fulfillment", "call-center"] as const;
const SERVICE_PLATFORMS = new Set<OblioInvoicePlatform>(["fulfillment", "call-center"]);

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export type SyncMonthResult = {
  year: number;
  month: number;
  totalScanned: number;
  serviceInvoiceCount: number;
};

export async function syncOblioMonth(year: number, month: number): Promise<SyncMonthResult | null> {
  const issuedAfter = `${year}-${pad(month)}-01`;
  const issuedBefore = `${year}-${pad(month)}-${pad(lastDayOfMonth(year, month))}`;

  const result = await fetchAllOblioInvoices(issuedAfter, issuedBefore);
  if (!result) return null;

  const active = result.invoices.filter((inv) => inv.canceled !== "1" && inv.draft !== "1");

  const totals: Record<OblioInvoicePlatform, { facturat: number; incasat: number; count: number }> = {
    emag: { facturat: 0, incasat: 0, count: 0 },
    trendyol: { facturat: 0, incasat: 0, count: 0 },
    site: { facturat: 0, incasat: 0, count: 0 },
    fulfillment: { facturat: 0, incasat: 0, count: 0 },
    "call-center": { facturat: 0, incasat: 0, count: 0 },
    altele: { facturat: 0, incasat: 0, count: 0 },
  };

  const serviceInvoiceIds: string[] = [];

  for (const inv of active) {
    const total = invoiceTotalRon(inv);
    const collected = inv.collected === "1";
    const platform = await classifyOblioInvoice({
      mentions: inv.mentions ?? "",
      total,
      clientName: inv.client?.name ?? "",
      link: inv.link,
    });

    totals[platform].facturat += total;
    totals[platform].incasat += collected ? total : 0;
    totals[platform].count += 1;

    if (SERVICE_PLATFORMS.has(platform)) {
      const id = `${inv.seriesName}${inv.number}`;
      serviceInvoiceIds.push(id);
      await prisma.oblioServiceInvoice.upsert({
        where: { id },
        create: {
          id,
          platform,
          referinta: inv.client?.name ?? "—",
          dataFacturii: inv.issueDate,
          dataScadenta: inv.dueDate ?? inv.issueDate,
          sumaFacturata: total,
          sumaIncasata: collected ? total : 0,
          status: collected ? "încasat" : "neîncasat",
        },
        update: {
          platform,
          referinta: inv.client?.name ?? "—",
          dataFacturii: inv.issueDate,
          dataScadenta: inv.dueDate ?? inv.issueDate,
          sumaFacturata: total,
          sumaIncasata: collected ? total : 0,
          status: collected ? "încasat" : "neîncasat",
        },
      });
    }
  }

  for (const platform of REAL_PLATFORMS) {
    await prisma.oblioMonthlyTotal.upsert({
      where: { year_month_platform: { year, month, platform } },
      create: {
        year,
        month,
        platform,
        sumaFacturata: totals[platform].facturat,
        sumaIncasata: totals[platform].incasat,
        numarFacturi: totals[platform].count,
      },
      update: {
        sumaFacturata: totals[platform].facturat,
        sumaIncasata: totals[platform].incasat,
        numarFacturi: totals[platform].count,
        lastSyncedAt: new Date(),
      },
    });
  }

  return {
    year,
    month,
    totalScanned: result.totalScanned,
    serviceInvoiceCount: serviceInvoiceIds.length,
  };
}
