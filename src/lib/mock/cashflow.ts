export type PlataMarfa = {
  id: string;
  data: string;
  tara: "china" | "romania";
  furnizor: string;
  suma: number;
  status: "achitat" | "programat";
};

export const platiMarfa: PlataMarfa[] = [
  { id: "PM-701", data: "2026-08-05", tara: "china", furnizor: "Ningbo Sports Co.", suma: 42100, status: "achitat" },
  { id: "PM-702", data: "2026-08-10", tara: "china", furnizor: "Shenzhen Fitness Ltd.", suma: 23400, status: "achitat" },
  { id: "PM-703", data: "2026-08-22", tara: "china", furnizor: "Guangzhou HomeGoods", suma: 30650, status: "programat" },
  { id: "PM-704", data: "2026-08-14", tara: "romania", furnizor: "Furnizor ambalaje SRL", suma: 4230, status: "achitat" },
  { id: "PM-705", data: "2026-08-28", tara: "romania", furnizor: "Transport Cargo Partner", suma: 9870, status: "programat" },
  { id: "PM-706", data: "2026-09-03", tara: "china", furnizor: "Hangzhou Wellness Co.", suma: 19700, status: "programat" },
];

export type SoldLunar = {
  luna: string;
  soldProiectat: number;
};

export const cashflowProiectie: SoldLunar[] = [
  { luna: "aug", soldProiectat: 84200 },
  { luna: "sep", soldProiectat: 52100 },
  { luna: "oct", soldProiectat: -12400 },
  { luna: "nov", soldProiectat: 8600 },
  { luna: "dec", soldProiectat: 41300 },
];

export const cashflowAlerta = {
  soldCurent: 84200,
  pragAlerta: 20000,
  lunaDeficit: cashflowProiectie.find((s) => s.soldProiectat < 0)?.luna ?? null,
};
