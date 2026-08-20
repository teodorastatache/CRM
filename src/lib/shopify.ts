import { createHmac, timingSafeEqual } from "node:crypto";

export const SHOPIFY_SCOPES =
  "read_orders,read_products,read_inventory,read_assigned_fulfillment_orders,write_assigned_fulfillment_orders";

export function verifyShopifyHmac(searchParams: URLSearchParams, secret: string): boolean {
  const hmac = searchParams.get("hmac");
  if (!hmac) return false;

  const pairs: string[] = [];
  for (const [key, value] of searchParams.entries()) {
    if (key === "hmac" || key === "signature") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const message = pairs.join("&");

  const computed = createHmac("sha256", secret).update(message).digest("hex");
  const computedBuf = Buffer.from(computed);
  const providedBuf = Buffer.from(hmac);
  if (computedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(computedBuf, providedBuf);
}

export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}
