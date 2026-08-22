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

export type RawOblioInvoice = {
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
  if (t.includes("procesare comenzi") || t.includes("depozitare") || t.includes("transport exped")) {
    return "fulfillment";
  }
  if (t.includes("contactare") || t.includes("marketing")) return "call-center";
  return "altele";
}

// Clienți confirmați manual când textul facturii nu se potrivește cu niciun cuvânt cheie cunoscut.
const KNOWN_CLIENT_PLATFORM_OVERRIDES: Record<string, OblioInvoicePlatform> = {
  "DNG-E COMMERCE S.R.L.": "fulfillment",
};

export async function classifyOblioInvoice(inv: {
  mentions: string;
  total: number;
  clientName: string;
  link?: string;
}): Promise<OblioInvoicePlatform> {
  const mentionsPlatform = classifyMentions(inv.mentions);
  if (mentionsPlatform !== "altele") return mentionsPlatform;

  // Storno-urile (facturi de anulare, cu sumă negativă) nu au mențiuni utile,
  // dar aparțin platformei comenzii originale — pe eMAG, în cazurile văzute până acum.
  if (inv.total < 0) return "emag";

  const override = KNOWN_CLIENT_PLATFORM_OVERRIDES[inv.clientName.toUpperCase()];
  if (override) return override;

  if (inv.link) {
    try {
      return await classifyByInvoicePdf(inv.link);
    } catch {
      // Nu am putut citi PDF-ul facturii — rămâne neclasificată.
    }
  }

  return "altele";
}

type RawOblioListResponse = {
  status: number;
  statusMessage?: string;
  data?: RawOblioInvoice[];
};

export type FetchAllOblioInvoicesResult = {
  invoices: RawOblioInvoice[];
  totalScanned: number;
  duplicatesSkipped: number;
  hitPageCap: boolean;
  pageErrors: { page: number; status?: number; statusMessage?: string }[];
};

export async function fetchAllOblioInvoices(
  issuedAfter: string,
  issuedBefore: string
): Promise<FetchAllOblioInvoicesResult | null> {
  const credentials = getCredentials();
  if (!credentials) return null;

  const token = await getOblioToken();
  const limit = 100;
  const seenIds = new Set<string>();
  const invoices: RawOblioInvoice[] = [];
  const pageErrors: { page: number; status?: number; statusMessage?: string }[] = [];
  let duplicatesSkipped = 0;
  let hitPageCap = true;

  // Limita de pagini e doar o plasă de siguranță împotriva unei bucle infinite —
  // paginarea reală se oprește când o pagină întoarce mai puține facturi decât limita.
  // Cu o limită prea mică (fostă 20 = 2000 facturi), lunile cu volum mare erau
  // trunchiate silențios, fără nicio eroare vizibilă.
  const maxPages = 100;

  for (let page = 0; page < maxPages; page++) {
    if (page > 0) await new Promise((resolve) => setTimeout(resolve, 300));
    let raw: RawOblioListResponse | null = null;
    let lastError: { status?: number; statusMessage?: string } = {};

    for (let attempt = 0; attempt < 4; attempt++) {
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
      lastError = { status: candidate.status, statusMessage: candidate.statusMessage };
      // Rate-limit (429) sau eroare temporară — reîncercăm cu backoff crescător.
      await new Promise((resolve) => setTimeout(resolve, Math.min(1500 * 2 ** attempt, 8000)));
    }

    if (!raw) {
      // Nu am putut citi această pagină nici după reîncercări — păstrăm ce am
      // adunat până acum în loc să aruncăm toate datele reale strânse deja.
      pageErrors.push({ page, ...lastError });
      hitPageCap = false;
      break;
    }

    const data = raw.data ?? [];
    // Contul are volum mare, iar facturile noi apărute în timp ce paginăm pot
    // deplasa offset-urile paginilor următoare, ducând la aceeași factură
    // citită de două ori — deduplicăm după serie+număr pe măsură ce le adunăm.
    for (const inv of data) {
      const id = `${inv.seriesName}${inv.number}`;
      if (seenIds.has(id)) {
        duplicatesSkipped += 1;
        continue;
      }
      seenIds.add(id);
      invoices.push(inv);
    }

    if (data.length < limit) {
      hitPageCap = false;
      break;
    }
  }

  return { invoices, totalScanned: invoices.length, duplicatesSkipped, hitPageCap, pageErrors };
}

export async function getOblioInvoiceSummaries(
  issuedAfter: string,
  issuedBefore: string
): Promise<OblioInvoiceSummary[] | null> {
  const result = await fetchAllOblioInvoices(issuedAfter, issuedBefore);
  if (!result) return null;

  // Facturile storno (corecții cu sumă negativă) sunt documente reale, emise —
  // spre deosebire de cele anulate/ciornă, ele trebuie incluse, ca să scadă
  // corect din totalul facturat platforma corespunzătoare.
  const active = result.invoices.filter((inv) => inv.canceled !== "1" && inv.draft !== "1");

  const summaries = await mapWithConcurrency(active, 8, async (inv) => {
      const total = Number(inv.total);
      const collected = inv.collected === "1";
      const platform = await classifyOblioInvoice({
        mentions: inv.mentions ?? "",
        total,
        clientName: inv.client?.name ?? "",
        link: inv.link,
      });
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
