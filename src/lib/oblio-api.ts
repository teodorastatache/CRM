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

export async function fetchOblioInvoicesRaw(params: Record<string, string> = {}): Promise<unknown> {
  const credentials = getCredentials();
  if (!credentials) throw new Error("Lipsesc credențialele Oblio.");

  const token = await getOblioToken();
  const url = new URL(`${OBLIO_BASE}/docs/invoice/list`);
  url.searchParams.set("cif", credentials.cif);
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
