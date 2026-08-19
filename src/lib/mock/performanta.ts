import { employees } from "./shared";

export type KpiAngajatRow = {
  angajat: string;
  rol: string;
  rateConversieRecenzii: number;
  listariRealizate: number;
  cadouriTrimise: number;
};

export const kpiAngajati: KpiAngajatRow[] = employees.map((emp, i) => ({
  angajat: emp.name,
  rol: emp.role,
  rateConversieRecenzii: Number((0.18 + ((i * 7) % 20) / 100).toFixed(2)),
  listariRealizate: 12 + ((i * 5) % 18),
  cadouriTrimise: 2 + (i % 5),
}));

export type KpiIncasariProfitRow = {
  angajat: string;
  incasariGenerate: number;
  profitAtribuit: number;
  marja: number;
};

export const kpiIncasariProfit: KpiIncasariProfitRow[] = employees.map((emp, i) => {
  const incasariGenerate = 18000 + i * 3200;
  const profitAtribuit = Math.round(incasariGenerate * (0.22 + (i % 4) * 0.02));
  return {
    angajat: emp.name,
    incasariGenerate,
    profitAtribuit,
    marja: Number((profitAtribuit / incasariGenerate).toFixed(3)),
  };
});
