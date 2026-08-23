import { prisma } from "@/lib/prisma";
import { transporturi } from "@/lib/mock/transporturi";

// Prima cerere reală "populează" tabela cu datele demo existente, ca lista
// să nu pornească goală înainte ca cineva să adauge primul transport real.
export async function ensureTransporturiSeeded() {
  const count = await prisma.transport.count();
  if (count > 0) return;
  await prisma.transport.createMany({ data: transporturi });
}
