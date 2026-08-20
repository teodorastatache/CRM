import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { SHOPIFY_SCOPES, isValidShopDomain } from "@/lib/shopify";

export async function GET(request: Request) {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  if (!clientId || !shop) {
    return NextResponse.json(
      { error: "Lipsesc SHOPIFY_CLIENT_ID sau SHOPIFY_STORE_DOMAIN din variabilele de mediu." },
      { status: 500 }
    );
  }
  if (!isValidShopDomain(shop)) {
    return NextResponse.json(
      { error: "SHOPIFY_STORE_DOMAIN trebuie să fie de forma nume.myshopify.com" },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${appUrl}/api/shopify/callback`;

  const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("scope", SHOPIFY_SCOPES);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
