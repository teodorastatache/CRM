import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyShopifyHmac, isValidShopDomain } from "@/lib/shopify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Lipsesc SHOPIFY_CLIENT_ID sau SHOPIFY_CLIENT_SECRET." },
      { status: 500 }
    );
  }

  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/shopify_oauth_state=([^;]+)/)?.[1];

  if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json({ error: "Domeniu magazin invalid." }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "Lipsește codul de autorizare." }, { status: 400 });
  }
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.json(
      { error: "Verificare state eșuată — reia procesul de conectare." },
      { status: 400 }
    );
  }
  if (!verifyShopifyHmac(url.searchParams, clientSecret)) {
    return NextResponse.json({ error: "Verificare HMAC eșuată." }, { status: 400 });
  }

  let tokenData: { access_token: string; scope: string };
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: "Shopify a refuzat schimbul de token." },
        { status: 502 }
      );
    }

    tokenData = await tokenRes.json();
  } catch {
    return NextResponse.json(
      { error: "Nu am putut contacta Shopify pentru schimbul de token. Încearcă din nou." },
      { status: 502 }
    );
  }

  await prisma.integration.upsert({
    where: { provider: "shopify" },
    create: {
      provider: "shopify",
      shopDomain: shop,
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
    },
    update: {
      shopDomain: shop,
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
    },
  });

  const response = NextResponse.redirect(new URL("/integrari?connected=shopify", url.origin));
  response.cookies.delete("shopify_oauth_state");
  return response;
}
