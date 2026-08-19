import { employees, fulfillmentClients } from "./shared";

export type ComenziZi = {
  data: string;
  shopify: number;
  emag: number;
  trendyol: number;
  sumaShopify: number;
  sumaEmag: number;
  sumaTrendyol: number;
};

export const comenziPlatformeZilnic: ComenziZi[] = [
  { data: "11 aug", shopify: 41, emag: 82, trendyol: 11, sumaShopify: 7420, sumaEmag: 13100, sumaTrendyol: 1720 },
  { data: "12 aug", shopify: 38, emag: 88, trendyol: 14, sumaShopify: 6980, sumaEmag: 14320, sumaTrendyol: 2140 },
  { data: "13 aug", shopify: 52, emag: 95, trendyol: 9, sumaShopify: 9310, sumaEmag: 15680, sumaTrendyol: 1380 },
  { data: "14 aug", shopify: 44, emag: 79, trendyol: 16, sumaShopify: 8020, sumaEmag: 12760, sumaTrendyol: 2510 },
  { data: "15 aug", shopify: 49, emag: 101, trendyol: 18, sumaShopify: 8870, sumaEmag: 16420, sumaTrendyol: 2830 },
  { data: "16 aug", shopify: 33, emag: 74, trendyol: 8, sumaShopify: 6120, sumaEmag: 11980, sumaTrendyol: 1240 },
  { data: "17 aug", shopify: 46, emag: 91, trendyol: 13, sumaShopify: 8420, sumaEmag: 14680, sumaTrendyol: 2150 },
];

export type RecenziiFirmaRow = {
  firma: string;
  recenziiAzi: number;
  recenziiLuna: number;
};

export const recenziiFirma: RecenziiFirmaRow[] = fulfillmentClients.map((client, i) => ({
  firma: client.name,
  recenziiAzi: 1 + (i % 4),
  recenziiLuna: 14 + i * 6,
}));

export type RecenzieNoua = {
  id: string;
  produs: string;
  rating: number;
  text: string;
  data: string;
  client: string;
};

export const recenziiNoi: RecenzieNoua[] = [
  { id: "RV-901", produs: "Covor mată yoga premium 6mm roz", rating: 5, text: "Calitate excelentă, aderență foarte bună.", data: "2026-08-17", client: "M. Vasilescu" },
  { id: "RV-902", produs: "Set benzi elastice fitness 5 buc", rating: 5, text: "Exact ce aveam nevoie pentru acasă.", data: "2026-08-17", client: "R. Ilie" },
  { id: "RV-903", produs: "Minge fitness anti-explozie 65cm", rating: 4, text: "Bună, dar livrarea a durat puțin mai mult.", data: "2026-08-16", client: "A. Georgescu" },
  { id: "RV-904", produs: "Saltea gimnastică pliabilă 180cm", rating: 5, text: "Foarte groasă și confortabilă.", data: "2026-08-16", client: "D. Toma" },
  { id: "RV-905", produs: "Covor mată yoga premium 6mm roz", rating: 5, text: "Al doilea comandat, la fel de bun.", data: "2026-08-15", client: "C. Marin" },
];

export type RecenzieAngajatRow = {
  angajat: string;
  recenziiLuna: number;
  rataConversie: number;
};

export const recenziiAngajat: RecenzieAngajatRow[] = employees
  .filter((e) => e.role !== "Fulfillment")
  .map((emp, i) => ({
    angajat: emp.name,
    recenziiLuna: 18 + ((i * 9) % 22),
    rataConversie: Number((0.16 + ((i * 5) % 18) / 100).toFixed(2)),
  }));

export type RotatieStocRow = {
  sku: string;
  produs: string;
  stocCurent: number;
  vitezaRotatieZile: number;
  valoareStocMort: number;
  zileRamaseStoc: number;
};

export const rotatieStoc: RotatieStocRow[] = [
  { sku: "PXM-0231", produs: "Covor mată yoga premium 6mm roz", stocCurent: 14, vitezaRotatieZile: 6, valoareStocMort: 0, zileRamaseStoc: 2 },
  { sku: "PXM-0118", produs: "Set benzi elastice fitness 5 buc", stocCurent: 31, vitezaRotatieZile: 9, valoareStocMort: 0, zileRamaseStoc: 4 },
  { sku: "PXM-0304", produs: "Saltea gimnastică pliabilă 180cm", stocCurent: 9, vitezaRotatieZile: 12, valoareStocMort: 0, zileRamaseStoc: 5 },
  { sku: "PXM-0092", produs: "Minge fitness anti-explozie 65cm", stocCurent: 22, vitezaRotatieZile: 15, valoareStocMort: 0, zileRamaseStoc: 6 },
  { sku: "PXM-0057", produs: "Bandă alergare pliabilă mini", stocCurent: 46, vitezaRotatieZile: 95, valoareStocMort: 8200, zileRamaseStoc: 210 },
  { sku: "PXM-0203", produs: "Set gantere cauciucate 2x5kg", stocCurent: 18, vitezaRotatieZile: 21, valoareStocMort: 0, zileRamaseStoc: 27 },
];
