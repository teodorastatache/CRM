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
  dataScadenta: string;
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
  dueDate?: string;
  total: string;
  currency?: string;
  exchangeRate?: string;
  mentions: string;
  link?: string;
  client?: { name?: string };
};

// Oblio dă mereu "total" în moneda facturii, nu convertit — pentru facturile
// în altă monedă decât RON (rare, dar reale) trebuie înmulțit cu cursul
// valutar trimis de API, altfel o sumă mică în HUF/EUR poate umfla enorm
// totalul (ex. 10.089 HUF citit ca "10.089 RON" în loc de 149,59 RON reali).
export function invoiceTotalRon(inv: { total: string; currency?: string; exchangeRate?: string }): number {
  const total = Number(inv.total);
  if (!inv.currency || inv.currency === "RON") return total;
  const rate = Number(inv.exchangeRate);
  return rate > 0 ? total * rate : total;
}

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

export async function classifyOblioInvoice(
  inv: {
    mentions: string;
    total: number;
    clientName: string;
    link?: string;
  },
  deadline?: number
): Promise<OblioInvoicePlatform> {
  const mentionsPlatform = classifyMentions(inv.mentions);
  if (mentionsPlatform !== "altele") return mentionsPlatform;

  // Storno-urile (facturi de anulare, cu sumă negativă) nu au mențiuni utile,
  // dar aparțin platformei comenzii originale — pe eMAG, în cazurile văzute până acum.
  if (inv.total < 0) return "emag";

  const override = KNOWN_CLIENT_PLATFORM_OVERRIDES[inv.clientName.toUpperCase()];
  if (override) return override;

  // Lunile cu mai multe facturi neclasificate pot avea nevoie de sute de
  // citiri de PDF — dacă bugetul de timp al rutei e pe cale să expire,
  // renunțăm la citirea PDF-ului (rămâne "altele") în loc să riscăm un 504.
  if (deadline && Date.now() > deadline) return "altele";

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
  timedOut: boolean;
  pageErrors: { page: number; status?: number; statusMessage?: string }[];
};

async function fetchOblioPageWithRetry(
  token: string,
  cif: string,
  issuedAfter: string,
  issuedBefore: string,
  limit: number,
  page: number
): Promise<{ raw: RawOblioListResponse | null; lastError: { status?: number; statusMessage?: string } }> {
  let lastError: { status?: number; statusMessage?: string } = {};

  for (let attempt = 0; attempt < 4; attempt++) {
    const candidate = (await fetchOblioPage(token, cif, {
      issuedAfter,
      issuedBefore,
      limitPerPage: String(limit),
      offset: String(page * limit),
      orderBy: "id",
      orderDir: "desc",
    })) as RawOblioListResponse;

    if (candidate.status === 200) return { raw: candidate, lastError };
    lastError = { status: candidate.status, statusMessage: candidate.statusMessage };
    // Rate-limit (429) sau eroare temporară — reîncercăm cu backoff crescător.
    await new Promise((resolve) => setTimeout(resolve, Math.min(1500 * 2 ** attempt, 8000)));
  }

  return { raw: null, lastError };
}

export async function fetchAllOblioInvoices(
  issuedAfter: string,
  issuedBefore: string,
  timeBudgetMs = 40000
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
  let timedOut = false;
  const deadline = Date.now() + timeBudgetMs;

  // Limita de pagini e doar o plasă de siguranță împotriva unei bucle infinite —
  // paginarea reală se oprește când o pagină întoarce mai puține facturi decât limita.
  // Cu o limită prea mică (fostă 20 = 2000 facturi), lunile cu volum mare erau
  // trunchiate silențios, fără nicio eroare vizibilă.
  const maxPages = 100;
  // Cerem paginile în loturi mici, în paralel, în loc de una câte una — mult
  // mai rapid, cu riscul (acceptat) de a lovi mai des rate-limit-ul lui Oblio,
  // atenuat de reîncercarea automată de mai sus.
  const batchSize = 4;

  outer: for (let batchStart = 0; batchStart < maxPages; batchStart += batchSize) {
    if (Date.now() > deadline) {
      // Bugetul de timp intern a expirat — întoarcem ce am adunat până acum
      // în loc să riscăm ca Vercel să omoare funcția cu un 504 fără răspuns.
      timedOut = true;
      hitPageCap = false;
      break;
    }

    const pagesInBatch = Math.min(batchSize, maxPages - batchStart);
    const batchResults = await Promise.all(
      Array.from({ length: pagesInBatch }, (_, i) =>
        fetchOblioPageWithRetry(token, credentials.cif, issuedAfter, issuedBefore, limit, batchStart + i)
      )
    );

    for (let i = 0; i < batchResults.length; i++) {
      const page = batchStart + i;
      const { raw, lastError } = batchResults[i];

      if (!raw) {
        // Nu am putut citi această pagină nici după reîncercări — păstrăm ce am
        // adunat până acum în loc să aruncăm toate datele reale strânse deja.
        pageErrors.push({ page, ...lastError });
        hitPageCap = false;
        break outer;
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
        break outer;
      }
    }
  }

  return { invoices, totalScanned: invoices.length, duplicatesSkipped, hitPageCap, timedOut, pageErrors };
}

// Refacerea completă (paginare prin toate facturile + citire PDF pentru cele
// neclasificate) poate dura zeci de secunde pe conturi cu volum mare — cache
// scurt per interval ca reîmprospătările repetate ale paginii să fie instant.
const summariesCache = new Map<string, { timestamp: number; data: OblioInvoiceSummary[] }>();
const SUMMARIES_CACHE_TTL_MS = 5 * 60 * 1000;

export async function getOblioInvoiceSummaries(
  issuedAfter: string,
  issuedBefore: string
): Promise<OblioInvoiceSummary[] | null> {
  const cacheKey = `${issuedAfter}_${issuedBefore}`;
  const cached = summariesCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SUMMARIES_CACHE_TTL_MS) {
    return cached.data;
  }

  const routeStart = Date.now();
  const result = await fetchAllOblioInvoices(issuedAfter, issuedBefore);
  if (!result) return null;

  // Facturile storno (corecții cu sumă negativă) sunt documente reale, emise —
  // spre deosebire de cele anulate/ciornă, ele trebuie incluse, ca să scadă
  // corect din totalul facturat platforma corespunzătoare.
  const active = result.invoices.filter((inv) => inv.canceled !== "1" && inv.draft !== "1");

  // Lunile cu multe facturi neclasificate pot avea nevoie de citiri PDF pentru
  // sute de facturi — lăsăm doar timp până aproape de limita rutei (60s).
  const classifyDeadline = routeStart + 55000;

  const summaries = await mapWithConcurrency(active, 16, async (inv) => {
      const total = invoiceTotalRon(inv);
      const collected = inv.collected === "1";
      const platform = await classifyOblioInvoice(
        {
          mentions: inv.mentions ?? "",
          total,
          clientName: inv.client?.name ?? "",
          link: inv.link,
        },
        classifyDeadline
      );
      return {
        id: `${inv.seriesName}${inv.number}`,
        referinta: inv.client?.name ?? "—",
        dataFacturii: inv.issueDate,
        dataScadenta: inv.dueDate ?? inv.issueDate,
        sumaFacturata: total,
        sumaIncasata: collected ? total : 0,
        status: collected ? "încasat" : "neîncasat",
        platform,
      } satisfies OblioInvoiceSummary;
  });

  summariesCache.set(cacheKey, { timestamp: Date.now(), data: summaries });
  return summaries;
}
