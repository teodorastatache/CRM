import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureComenziAvionSeeded, nextSequentialId, STATUS_COMANDA } from "@/lib/comenzi-db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureComenziAvionSeeded();
  const rows = await prisma.comandaAvion.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const furnizor = String(body.furnizor ?? "").trim();
  const produse = String(body.produse ?? "").trim();
  const cantitate = Number(body.cantitate);
  const awb = String(body.awb ?? "").trim() || "—";
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

  await ensureComenziAvionSeeded();
  const existing = await prisma.comandaAvion.findMany({ select: { id: true } });
  const id = nextSequentialId(existing.map((r) => r.id), "CA", 701);

  const row = await prisma.comandaAvion.create({
    data: { id, furnizor, produse, cantitate, awb, dataPlecare, dataSosireEstimata, valoare, status },
  });
  return NextResponse.json(row, { status: 201 });
}
