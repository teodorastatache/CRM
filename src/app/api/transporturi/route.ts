import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextSequentialId, STATUS_COMANDA } from "@/lib/comenzi-db";
import { ensureTransporturiSeeded } from "@/lib/transporturi-db";

export const dynamic = "force-dynamic";

const TIP_TRANSPORT = ["container", "colet aerian"] as const;

export async function GET() {
  await ensureTransporturiSeeded();
  const rows = await prisma.transport.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const furnizor = String(body.furnizor ?? "").trim();
  const produse = String(body.produse ?? "").trim();
  const cantitate = Number(body.cantitate);
  const tip = String(body.tip ?? "");
  const dataPlecare = String(body.dataPlecare ?? "").trim() || "—";
  const dataEstimataSosire = String(body.dataEstimataSosire ?? "").trim();
  const valoare = Number(body.valoare);
  const status = String(body.status ?? "");

  if (
    !furnizor ||
    !produse ||
    !dataEstimataSosire ||
    !Number.isFinite(cantitate) ||
    !Number.isFinite(valoare) ||
    !TIP_TRANSPORT.includes(tip as (typeof TIP_TRANSPORT)[number]) ||
    !STATUS_COMANDA.includes(status as (typeof STATUS_COMANDA)[number])
  ) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  await ensureTransporturiSeeded();
  const existing = await prisma.transport.findMany({ select: { id: true } });
  const id = nextSequentialId(existing.map((r) => r.id), "TR", 2201);

  const row = await prisma.transport.create({
    data: { id, furnizor, produse, cantitate, tip, dataPlecare, dataEstimataSosire, valoare, status },
  });
  return NextResponse.json(row, { status: 201 });
}
