import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureComenziPendingSeeded, nextSequentialId } from "@/lib/comenzi-db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureComenziPendingSeeded();
  const rows = await prisma.comandaPending.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const furnizor = String(body.furnizor ?? "").trim();
  const produse = String(body.produse ?? "").trim();
  const valoare = Number(body.valoare);
  const motivPending = String(body.motivPending ?? "").trim();
  const dataCreare = String(body.dataCreare ?? "").trim();

  if (!furnizor || !produse || !motivPending || !dataCreare || !Number.isFinite(valoare)) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  await ensureComenziPendingSeeded();
  const existing = await prisma.comandaPending.findMany({ select: { id: true } });
  const id = nextSequentialId(existing.map((r) => r.id), "CP", 311);

  const row = await prisma.comandaPending.create({
    data: { id, furnizor, produse, valoare, motivPending, dataCreare },
  });
  return NextResponse.json(row, { status: 201 });
}
