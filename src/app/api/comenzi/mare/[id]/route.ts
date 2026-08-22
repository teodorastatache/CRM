import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUS_COMANDA } from "@/lib/comenzi-db";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const furnizor = String(body.furnizor ?? "").trim();
  const produse = String(body.produse ?? "").trim();
  const cantitate = Number(body.cantitate);
  const dataPlecare = String(body.dataPlecare ?? "").trim() || "—";
  const dataSosireEstimata = String(body.dataSosireEstimata ?? "").trim();
  const valoare = Number(body.valoare);
  const status = String(body.status ?? "");

  if (
    !furnizor ||
    !produse ||
    !dataSosireEstimata ||
    !Number.isFinite(cantitate) ||
    !Number.isFinite(valoare) ||
    !STATUS_COMANDA.includes(status as (typeof STATUS_COMANDA)[number])
  ) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  try {
    const row = await prisma.comandaMare.update({
      where: { id },
      data: { furnizor, produse, cantitate, dataPlecare, dataSosireEstimata, valoare, status },
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Comandă negăsită." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.comandaMare.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Comandă negăsită." }, { status: 404 });
  }
}
