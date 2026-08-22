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

function classifyMentions(mentions: string): OblioInvoicePlatform {
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
  client?: { name?: string };
};

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
    const raw = (await fetchOblioPage(token, credentials.cif, {
      issuedAfter,
      issuedBefore,
      limitPerPage: String(limit),
      offset: String(page * limit),
      orderBy: "id",
      orderDir: "desc",
    })) as RawOblioListResponse;

    if (raw.status !== 200) {
      throw new Error(`Oblio a returnat eroare: ${raw.statusMessage ?? "necunoscută"}`);
    }

    const data = raw.data ?? [];
    invoices.push(...data);
    if (data.length < limit) break;
  }

  return invoices
    .filter((inv) => inv.canceled !== "1" && inv.storno !== "1" && inv.draft !== "1")
    .map((inv) => {
      const total = Number(inv.total);
      const collected = inv.collected === "1";
      return {
        id: `${inv.seriesName}${inv.number}`,
        referinta: inv.client?.name ?? "—",
        dataFacturii: inv.issueDate,
        sumaFacturata: total,
        sumaIncasata: collected ? total : 0,
        status: collected ? "încasat" : "neîncasat",
        platform: classifyMentions(inv.mentions ?? ""),
      };
    });
}
