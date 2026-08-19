export type ComandaMare = {
  id: string;
  furnizor: string;
  produse: string;
  cantitate: number;
  dataPlecare: string;
  dataSosireEstimata: string;
  valoare: number;
  status: "în pregătire" | "pe drum" | "finalizat";
};

export const comenziMare: ComandaMare[] = [
  { id: "CM-501", furnizor: "Ningbo Sports Co.", produse: "Covoare yoga premium", cantitate: 2400, dataPlecare: "2026-07-02", dataSosireEstimata: "2026-08-25", valoare: 84200, status: "pe drum" },
  { id: "CM-502", furnizor: "Guangzhou HomeGoods", produse: "Saltele gimnastică pliabile", cantitate: 1500, dataPlecare: "—", dataSosireEstimata: "2026-09-30", valoare: 61300, status: "în pregătire" },
  { id: "CM-503", furnizor: "Hangzhou Wellness Co.", produse: "Set greutăți reglabile", cantitate: 800, dataPlecare: "2026-07-28", dataSosireEstimata: "2026-09-12", valoare: 39400, status: "pe drum" },
  { id: "CM-504", furnizor: "Shenzhen Fitness Ltd.", produse: "Benzi elastice + accesorii", cantitate: 6100, dataPlecare: "2026-06-18", dataSosireEstimata: "2026-08-05", valoare: 46700, status: "finalizat" },
];

export type ComandaAvion = {
  id: string;
  furnizor: string;
  produse: string;
  cantitate: number;
  awb: string;
  dataPlecare: string;
  dataSosireEstimata: string;
  valoare: number;
  status: "în pregătire" | "pe drum" | "finalizat";
};

export const comenziAvion: ComandaAvion[] = [
  { id: "CA-701", furnizor: "Yiwu Trade SRL", produse: "Mingi fitness + accesorii mici", cantitate: 3200, awb: "AWB-88213", dataPlecare: "2026-08-10", dataSosireEstimata: "2026-08-22", valoare: 18900, status: "pe drum" },
  { id: "CA-702", furnizor: "Fujian Textile Group", produse: "Prosoape sport microfibră", cantitate: 5400, awb: "AWB-88304", dataPlecare: "—", dataSosireEstimata: "2026-09-05", valoare: 9200, status: "în pregătire" },
  { id: "CA-703", furnizor: "Shenzhen Fitness Ltd.", produse: "Mostre produse noi", cantitate: 120, awb: "AWB-88190", dataPlecare: "2026-08-01", dataSosireEstimata: "2026-08-14", valoare: 2100, status: "finalizat" },
];

export type ComandaPending = {
  id: string;
  furnizor: string;
  produse: string;
  valoare: number;
  motivPending: string;
  dataCreare: string;
};

export const comenziPending: ComandaPending[] = [
  { id: "CP-311", furnizor: "Hangzhou Wellness Co.", produse: "Bandă alergare pliabilă", valoare: 24500, motivPending: "Așteptare confirmare preț final", dataCreare: "2026-08-12" },
  { id: "CP-312", furnizor: "Ningbo Sports Co.", produse: "Covoare yoga – model nou", valoare: 31200, motivPending: "Așteptare mostră aprobată", dataCreare: "2026-08-14" },
  { id: "CP-313", furnizor: "Guangzhou HomeGoods", produse: "Perne posturale ergonomice", valoare: 12800, motivPending: "Așteptare plată avans", dataCreare: "2026-08-16" },
];
