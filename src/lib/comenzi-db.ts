import { prisma } from "@/lib/prisma";
import { comenziMare, comenziAvion, comenziPending } from "@/lib/mock/comenzi";

export const STATUS_COMANDA = ["în pregătire", "pe drum", "finalizat"] as const;

// Prima cerere reală "populează" tabelele cu datele demo existente, ca lista
// să nu pornească goală înainte ca cineva să adauge prima comandă reală.
export async function ensureComenziMareSeeded() {
  const count = await prisma.comandaMare.count();
  if (count > 0) return;
  await prisma.comandaMare.createMany({ data: comenziMare });
}

export async function ensureComenziAvionSeeded() {
  const count = await prisma.comandaAvion.count();
  if (count > 0) return;
  await prisma.comandaAvion.createMany({ data: comenziAvion });
}

export async function ensureComenziPendingSeeded() {
  const count = await prisma.comandaPending.count();
  if (count > 0) return;
  await prisma.comandaPending.createMany({ data: comenziPending });
}

// Continuă numerotarea existentă (CM-501, CM-502, ...) în loc de un id opac.
export function nextSequentialId(existingIds: string[], prefix: string, start: number): string {
  let max = start - 1;
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  for (const id of existingIds) {
    const m = re.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${max + 1}`;
}
