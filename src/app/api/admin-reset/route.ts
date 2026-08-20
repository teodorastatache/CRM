import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const configuredSecret = process.env.ADMIN_RESET_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Resetarea nu e configurată (lipsește ADMIN_RESET_SECRET)." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { resetSecret, email, password } = body as {
    resetSecret?: string;
    email?: string;
    password?: string;
  };

  if (typeof resetSecret !== "string" || !safeEqual(resetSecret, configuredSecret)) {
    return NextResponse.json({ error: "Cod de resetare incorect." }, { status: 401 });
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalid." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Parola trebuie să aibă minim 8 caractere." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });
  } else {
    await prisma.user.create({
      data: { email: normalizedEmail, passwordHash, role: "OWNER" },
    });
  }

  return NextResponse.json({ ok: true });
}
