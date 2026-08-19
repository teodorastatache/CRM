export type TransportStatus = "în pregătire" | "pe drum" | "finalizat";

export type Transport = {
  id: string;
  furnizor: string;
  produse: string;
  cantitate: number;
  tip: "container" | "colet aerian";
  dataPlecare: string;
  dataEstimataSosire: string;
  valoare: number;
  status: TransportStatus;
};

export const transporturi: Transport[] = [
  { id: "TR-2201", furnizor: "Ningbo Sports Co.", produse: "Covoare yoga premium", cantitate: 2400, tip: "container", dataPlecare: "2026-07-02", dataEstimataSosire: "2026-08-25", valoare: 84200, status: "pe drum" },
  { id: "TR-2202", furnizor: "Shenzhen Fitness Ltd.", produse: "Benzi elastice + accesorii", cantitate: 6100, tip: "container", dataPlecare: "2026-06-18", dataEstimataSosire: "2026-08-05", valoare: 46700, status: "finalizat" },
  { id: "TR-2203", furnizor: "Guangzhou HomeGoods", produse: "Saltele gimnastică pliabile", cantitate: 1500, tip: "container", dataPlecare: "—", dataEstimataSosire: "2026-09-30", valoare: 61300, status: "în pregătire" },
  { id: "TR-2204", furnizor: "Yiwu Trade SRL", produse: "Mingi fitness + accesorii mici", cantitate: 3200, tip: "colet aerian", dataPlecare: "2026-08-10", dataEstimataSosire: "2026-08-22", valoare: 18900, status: "pe drum" },
  { id: "TR-2205", furnizor: "Hangzhou Wellness Co.", produse: "Set greutăți reglabile", cantitate: 800, tip: "container", dataPlecare: "2026-07-28", dataEstimataSosire: "2026-09-12", valoare: 39400, status: "pe drum" },
  { id: "TR-2206", furnizor: "Fujian Textile Group", produse: "Prosoape sport microfibră", cantitate: 5400, tip: "colet aerian", dataPlecare: "—", dataEstimataSosire: "2026-09-05", valoare: 9200, status: "în pregătire" },
  { id: "TR-2207", furnizor: "Ningbo Sports Co.", produse: "Covoare yoga premium – lot 2", cantitate: 1800, tip: "container", dataPlecare: "2026-05-20", dataEstimataSosire: "2026-07-15", valoare: 63100, status: "finalizat" },
];
