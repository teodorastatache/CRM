import { fulfillmentClients } from "./shared";

export type IncasariStatus = "încasat" | "parțial" | "neîncasat";

export type IncasariRow = {
  id: string;
  referinta: string;
  dataFacturii: string;
  sumaFacturata: number;
  sumaIncasata: number;
  status: IncasariStatus;
};

export type PlatformaIncasari = "emag" | "trendyol" | "site" | "fulfillment" | "call-center";

export const platformIncasari: Record<PlatformaIncasari, IncasariRow[]> = {
  emag: [
    { id: "FE-3391", referinta: "Comenzi eMAG 05-11 aug", dataFacturii: "2026-08-12", sumaFacturata: 48210, sumaIncasata: 48210, status: "încasat" },
    { id: "FE-3402", referinta: "Comenzi eMAG 12-18 aug", dataFacturii: "2026-08-19", sumaFacturata: 51940, sumaIncasata: 51940, status: "încasat" },
    { id: "FE-3418", referinta: "Comenzi eMAG 19-25 aug", dataFacturii: "2026-08-26", sumaFacturata: 46870, sumaIncasata: 0, status: "neîncasat" },
    { id: "FE-3420", referinta: "Comenzi eMAG 26 aug-01 sep", dataFacturii: "2026-09-02", sumaFacturata: 53100, sumaIncasata: 21000, status: "parțial" },
  ],
  trendyol: [
    { id: "FT-1102", referinta: "Comenzi Trendyol iulie", dataFacturii: "2026-08-05", sumaFacturata: 27430, sumaIncasata: 27430, status: "încasat" },
    { id: "FT-1118", referinta: "Comenzi Trendyol 01-15 aug", dataFacturii: "2026-08-16", sumaFacturata: 15320, sumaIncasata: 15320, status: "încasat" },
    { id: "FT-1124", referinta: "Comenzi Trendyol 16-31 aug", dataFacturii: "2026-09-01", sumaFacturata: 12680, sumaIncasata: 0, status: "neîncasat" },
  ],
  site: [
    { id: "FS-8801", referinta: "Comenzi Shopify iulie", dataFacturii: "2026-08-01", sumaFacturata: 118340, sumaIncasata: 118340, status: "încasat" },
    { id: "FS-8830", referinta: "Comenzi Shopify 01-17 aug", dataFacturii: "2026-08-18", sumaFacturata: 64200, sumaIncasata: 64200, status: "încasat" },
    { id: "FS-8847", referinta: "Comenzi Shopify 18 aug-prezent", dataFacturii: "2026-08-18", sumaFacturata: 34910, sumaIncasata: 12000, status: "parțial" },
  ],
  fulfillment: fulfillmentClients.map((client, i) => ({
    id: `FF-${5510 + i}`,
    referinta: `Servicii fulfillment ${client.name} · august`,
    dataFacturii: "2026-08-01",
    sumaFacturata: 6200 + i * 1450,
    sumaIncasata: i % 3 === 0 ? 0 : 6200 + i * 1450,
    status: i % 3 === 0 ? "neîncasat" : "încasat",
  })),
  "call-center": [
    { id: "FC-2201", referinta: "Servicii call center FitZone Store · august", dataFacturii: "2026-08-01", sumaFacturata: 4800, sumaIncasata: 4800, status: "încasat" },
    { id: "FC-2202", referinta: "Servicii call center HomeDecor Plus · august", dataFacturii: "2026-08-01", sumaFacturata: 3600, sumaIncasata: 3600, status: "încasat" },
    { id: "FC-2203", referinta: "Servicii call center BabyCare Comfort · august", dataFacturii: "2026-08-01", sumaFacturata: 3100, sumaIncasata: 0, status: "neîncasat" },
    { id: "FC-2204", referinta: "Servicii call center GreenGarden Deco · august", dataFacturii: "2026-08-01", sumaFacturata: 2450, sumaIncasata: 1200, status: "parțial" },
  ],
};

export type CheltuialaRow = {
  id: string;
  categorie: string;
  descriere: string;
  luna: string;
  suma: number;
  tip: "plată" | "cheltuială operațională";
};

export const platiCheltuieli: CheltuialaRow[] = [
  { id: "CH-101", categorie: "Chirie", descriere: "Chirie depozit fulfillment", luna: "2026-08", suma: 12500, tip: "cheltuială operațională" },
  { id: "CH-102", categorie: "Utilități", descriere: "Curent + internet depozit", luna: "2026-08", suma: 2180, tip: "cheltuială operațională" },
  { id: "CH-103", categorie: "Salarii", descriere: "Salarii echipă fulfillment + call center", luna: "2026-08", suma: 38900, tip: "plată" },
  { id: "CH-104", categorie: "Transport", descriere: "Transport marfă China → România", luna: "2026-08", suma: 21400, tip: "plată" },
  { id: "CH-105", categorie: "Ambalaje", descriere: "Cutii, folie, etichete", luna: "2026-08", suma: 5320, tip: "cheltuială operațională" },
  { id: "CH-106", categorie: "Software", descriere: "Abonamente EasySales, contabilitate, CRM", luna: "2026-08", suma: 1640, tip: "cheltuială operațională" },
  { id: "CH-107", categorie: "Contabilitate", descriere: "Servicii contabilitate externă", luna: "2026-08", suma: 1200, tip: "plată" },
];

export type MarketingBudgetRow = {
  canal: string;
  luna: string;
  bugetAlocat: number;
  cheltuit: number;
};

export const marketingBuget: MarketingBudgetRow[] = [
  { canal: "Meta Ads", luna: "2026-08", bugetAlocat: 18000, cheltuit: 16420 },
  { canal: "Google Ads", luna: "2026-08", bugetAlocat: 9000, cheltuit: 8710 },
  { canal: "TikTok Ads", luna: "2026-08", bugetAlocat: 4000, cheltuit: 2380 },
  { canal: "Influenceri", luna: "2026-08", bugetAlocat: 6000, cheltuit: 6000 },
  { canal: "eMAG Smart Ads", luna: "2026-08", bugetAlocat: 5500, cheltuit: 5120 },
];

export type FacturaDeAchitat = {
  id: string;
  furnizor: string;
  suma: number;
  scadenta: string;
  zilePanaLaScadenta: number;
  status: "urgent" | "în termen" | "achitat";
};

export const facturiDeAchitat: FacturaDeAchitat[] = [
  { id: "FZ-4471", furnizor: "Furnizor ambalaje SRL", suma: 4230, scadenta: "2026-08-19", zilePanaLaScadenta: 1, status: "urgent" },
  { id: "FZ-4488", furnizor: "Transport Cargo Partner", suma: 9870, scadenta: "2026-08-21", zilePanaLaScadenta: 3, status: "urgent" },
  { id: "FZ-4502", furnizor: "Agenție Marketing DigitalUp", suma: 6500, scadenta: "2026-08-27", zilePanaLaScadenta: 9, status: "în termen" },
  { id: "FZ-4510", furnizor: "Depozit & Chirie SRL", suma: 12500, scadenta: "2026-09-01", zilePanaLaScadenta: 14, status: "în termen" },
  { id: "FZ-4390", furnizor: "Furnizor cutii carton", suma: 2140, scadenta: "2026-08-10", zilePanaLaScadenta: -8, status: "achitat" },
];

export type IncasareFulfillmentFirma = {
  firma: string;
  facturat: number;
  incasat: number;
  restDeIncasat: number;
  nrComenzi: number;
};

export const incasariFulfillmentPerFirma: IncasareFulfillmentFirma[] = fulfillmentClients.map((client, i) => {
  const facturat = 6200 + i * 1450;
  const incasat = i % 3 === 0 ? 0 : facturat;
  return {
    firma: client.name,
    facturat,
    incasat,
    restDeIncasat: facturat - incasat,
    nrComenzi: 180 + i * 65,
  };
});

export type TranzactieBanca = {
  id: string;
  data: string;
  descriere: string;
  suma: number;
  sursa: string;
  status: "potrivit" | "nepotrivit";
};

export const sincronizareBanca: TranzactieBanca[] = [
  { id: "TB-9001", data: "2026-08-17", descriere: "Încasare eMAG Marketplace", suma: 48210, sursa: "eMAG", status: "potrivit" },
  { id: "TB-9002", data: "2026-08-17", descriere: "Plată furnizor ambalaje", suma: -4230, sursa: "Extras cont", status: "nepotrivit" },
  { id: "TB-9003", data: "2026-08-16", descriere: "Încasare Shopify", suma: 64200, sursa: "Shopify", status: "potrivit" },
  { id: "TB-9004", data: "2026-08-15", descriere: "Plată transport marfă", suma: -21400, sursa: "Extras cont", status: "potrivit" },
  { id: "TB-9005", data: "2026-08-14", descriere: "Încasare servicii fulfillment", suma: 6200, sursa: "Extras cont", status: "nepotrivit" },
];
