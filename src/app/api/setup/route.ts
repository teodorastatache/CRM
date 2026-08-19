import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    return NextResponse.json(
      { error: "Contul de admin există deja. Folosește pagina de login." },
      { status: 409 }
    );
  }

  const body = await request.json();
  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalid." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Parola trebuie să aibă minim 8 caractere." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name: typeof name === "string" && name.trim() ? name.trim() : null,
      passwordHash,
      role: "OWNER",
    },
  });

  return NextResponse.json({ ok: true });
}
