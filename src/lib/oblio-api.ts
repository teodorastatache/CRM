const OBLIO_BASE = "https://www.oblio.eu/api";

function getCredentials() {
  const email = process.env.OBLIO_EMAIL;
  const secret = process.env.OBLIO_SECRET;
  const cif = process.env.OBLIO_CIF;
  if (!email || !secret || !cif) return null;
  return { email, secret, cif };
}

export function isOblioConfigured(): boolean {
  return getCredentials() !== null;
}

type OblioTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
};

export async function getOblioToken(): Promise<string> {
  const credentials = getCredentials();
  if (!credentials) throw new Error("Lipsesc credențialele Oblio.");

  const res = await fetch(`${OBLIO_BASE}/authorize/token`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: credentials.email,
      client_secret: credentials.secret,
      grant_type: "client_credentials",
    }),
  });

  const text = await res.text();
  let json: OblioTokenResponse;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Oblio a răspuns non-JSON la autentificare (status ${res.status}): ${text.slice(0, 500)}`);
  }

  if (!res.ok || !json.access_token) {
    throw new Error(`Oblio a refuzat autentificarea (status ${res.status}): ${text.slice(0, 500)}`);
  }

  return json.access_token;
}

async function fetchOblioPage(token: string, cif: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`${OBLIO_BASE}/docs/invoice/list`);
  url.searchParams.set("cif", cif);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Oblio a răspuns non-JSON la /docs/invoice/list (status ${res.status}): ${text.slice(0, 500)}`);
  }
}

export async function fetchOblioInvoicesRaw(params: Record<string, string> = {}): Promise<unknown> {
  const credentials = getCredentials();
  if (!credentials) throw new Error("Lipsesc credențialele Oblio.");
  const token = await getOblioToken();
  return fetchOblioPage(token, credentials.cif, params);
}

export type OblioInvoicePlatform = "emag" | "trendyol" | "site" | "fulfillment" | "call-center" | "altele";

export type OblioInvoiceSummary = {
  id: string;
  referinta: string;
  dataFacturii: string;
  sumaFacturata: number;
  sumaIncasata: number;
  status: "încasat" | "neîncasat";
  platform: OblioInvoicePlatform;
};

export function classifyMentions(mentions: string): OblioInvoicePlatform {
  const text = mentions.toLowerCase();
  if (text.includes("emag")) return "emag";
  if (text.includes("trendyol")) return "trendyol";
  if (text.includes("infiniteea")) return "site";
  if (text.includes("procesare comenzi")) return "fulfillment";
  if (text.includes("contactare") || text.includes("marketing")) return "call-center";
  return "altele";
}

type RawOblioInvoice = {
  draft: string;
  canceled: string;
  collected: string;
  storno: string;
  seriesName: string;
  number: string;
  issueDate: string;
  total: string;
  mentions: string;
  link?: string;
  client?: { name?: string };
};

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

export async function classifyByInvoicePdf(link: string): Promise<OblioInvoicePlatform> {
  const res = await fetch(link, { cache: "no-store" });
  if (!res.ok) return "altele";
  const buffer = Buffer.from(await res.arrayBuffer());
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const { text } = await pdfParse(buffer);
  const t = text.toLowerCase();
  if (t.includes("procesare comenzi")) return "fulfillment";
  if (t.includes("contactare") || t.includes("marketing")) return "call-center";
  return "altele";
}

type RawOblioListResponse = {
  status: number;
  statusMessage?: string;
  data?: RawOblioInvoice[];
};

export async function getOblioInvoiceSummaries(
  issuedAfter: string,
  issuedBefore: string
): Promise<OblioInvoiceSummary[] | null> {
  const credentials = getCredentials();
  if (!credentials) return null;

  const token = await getOblioToken();
  const limit = 100;
  const invoices: RawOblioInvoice[] = [];

  for (let page = 0; page < 20; page++) {
    if (page > 0) await new Promise((resolve) => setTimeout(resolve, 200));
    let raw: RawOblioListResponse | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = (await fetchOblioPage(token, credentials.cif, {
        issuedAfter,
        issuedBefore,
        limitPerPage: String(limit),
        offset: String(page * limit),
        orderBy: "id",
        orderDir: "desc",
      })) as RawOblioListResponse;

      if (candidate.status === 200) {
        raw = candidate;
        break;
      }
      // Posibil rate-limit temporar — reîncercăm cu backoff înainte să renunțăm.
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }

    if (!raw) {
      // Nu am putut citi această pagină — păstrăm ce am adunat până acum
      // în loc să aruncăm toate datele reale strânse deja.
      break;
    }

    const data = raw.data ?? [];
    invoices.push(...data);
    if (data.length < limit) break;
  }

  const active = invoices.filter((inv) => inv.canceled !== "1" && inv.storno !== "1" && inv.draft !== "1");

  const summaries = await mapWithConcurrency(active, 8, async (inv) => {
      const total = Number(inv.total);
      const collected = inv.collected === "1";
      let platform = classifyMentions(inv.mentions ?? "");
      if (platform === "altele" && inv.link) {
        try {
          platform = await classifyByInvoicePdf(inv.link);
        } catch {
          // Nu am putut citi PDF-ul facturii — rămâne neclasificată.
        }
      }
      return {
        id: `${inv.seriesName}${inv.number}`,
        referinta: inv.client?.name ?? "—",
        dataFacturii: inv.issueDate,
        sumaFacturata: total,
        sumaIncasata: collected ? total : 0,
        status: collected ? "încasat" : "neîncasat",
        platform,
      } satisfies OblioInvoiceSummary;
  });

  return summaries;
}
