import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const furnizor = String(body.furnizor ?? "").trim();
  const produse = String(body.produse ?? "").trim();
  const valoare = Number(body.valoare);
  const motivPending = String(body.motivPending ?? "").trim();
  const dataCreare = String(body.dataCreare ?? "").trim();

  if (!furnizor || !produse || !motivPending || !dataCreare || !Number.isFinite(valoare)) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  try {
    const row = await prisma.comandaPending.update({
      where: { id },
      data: { furnizor, produse, valoare, motivPending, dataCreare },
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Comandă negăsită." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.comandaPending.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Comandă negăsită." }, { status: 404 });
  }
}
