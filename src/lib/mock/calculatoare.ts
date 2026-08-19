import { callCenterClients, fulfillmentClients } from "./shared";

export type ContractRow = {
  client: string;
  status: "semnat" | "pending";
  dataSemnare: string;
  valoareLunara: number;
};

export const contracteFulfillment: ContractRow[] = fulfillmentClients.map((client, i) => ({
  client: client.name,
  status: i === fulfillmentClients.length - 1 ? "pending" : "semnat",
  dataSemnare: i === fulfillmentClients.length - 1 ? "—" : `2026-0${(i % 6) + 2}-1${i}`,
  valoareLunara: 6200 + i * 1450,
}));

export type FisaClientRow = {
  client: string;
  nrPaleti: number;
  nrRafturi: number;
  transport: string;
  nrComenziLunar: number;
};

export const fiseClientiFulfillment: FisaClientRow[] = fulfillmentClients.map((client, i) => ({
  client: client.name,
  nrPaleti: 4 + i * 2,
  nrRafturi: 8 + i * 3,
  transport: i % 2 === 0 ? "Cargus" : "Sameday",
  nrComenziLunar: 180 + i * 65,
}));

export type MarfaReceptionataRow = {
  data: string;
  client: string;
  produs: string;
  cantitate: number;
};

export const marfaReceptionata: MarfaReceptionataRow[] = [
  { data: "2026-08-15", client: "FitZone Store SRL", produs: "Genți sport impermeabile", cantitate: 420 },
  { data: "2026-08-14", client: "HomeDecor Plus", produs: "Lumânări parfumate set 3buc", cantitate: 900 },
  { data: "2026-08-13", client: "BabyCare Comfort", produs: "Body-uri bumbac 0-6 luni", cantitate: 650 },
  { data: "2026-08-12", client: "PetLux SRL", produs: "Lese câini reglabile", cantitate: 310 },
  { data: "2026-08-10", client: "TechGadget Hub", produs: "Suporturi telefon auto", cantitate: 780 },
];

export type FacturareAutomataRow = {
  client: string;
  luna: string;
  nrComenzi: number;
  tarifUnitar: number;
  totalFacturat: number;
};

export const facturareAutomataFulfillment: FacturareAutomataRow[] = fulfillmentClients.map((client, i) => {
  const nrComenzi = 180 + i * 65;
  const tarifUnitar = 6.5 + (i % 3) * 0.5;
  return {
    client: client.name,
    luna: "2026-08",
    nrComenzi,
    tarifUnitar,
    totalFacturat: Math.round(nrComenzi * tarifUnitar),
  };
});

export const contracteCallCenter: ContractRow[] = callCenterClients.map((client, i) => ({
  client: client.name,
  status: i === callCenterClients.length - 1 ? "pending" : "semnat",
  dataSemnare: i === callCenterClients.length - 1 ? "—" : `2026-0${(i % 6) + 3}-0${i + 5}`,
  valoareLunara: 2450 + i * 850,
}));

export type ListaTrimisaRow = {
  id: string;
  client: string;
  nrContacte: number;
  dataTrimitere: string;
  status: "în lucru" | "finalizată";
};

export const listeTrimiseCallCenter: ListaTrimisaRow[] = [
  { id: "LT-401", client: "FitZone Store SRL", nrContacte: 120, dataTrimitere: "2026-08-14", status: "finalizată" },
  { id: "LT-402", client: "HomeDecor Plus", nrContacte: 85, dataTrimitere: "2026-08-15", status: "finalizată" },
  { id: "LT-403", client: "BabyCare Comfort", nrContacte: 60, dataTrimitere: "2026-08-16", status: "în lucru" },
  { id: "LT-404", client: "GreenGarden Deco", nrContacte: 45, dataTrimitere: "2026-08-17", status: "în lucru" },
];

export type RaportRecenziiConversieRow = {
  client: string;
  listeTrimise: number;
  recenziiObtinute: number;
  rataConversie: number;
};

export const raportRecenziiConversieCallCenter: RaportRecenziiConversieRow[] = callCenterClients.map((client, i) => {
  const listeTrimise = 60 + i * 25;
  const recenziiObtinute = Math.round(listeTrimise * (0.14 + (i % 3) * 0.03));
  return {
    client: client.name,
    listeTrimise,
    recenziiObtinute,
    rataConversie: Number((recenziiObtinute / listeTrimise).toFixed(2)),
  };
});

export type CadouRow = {
  client: string;
  produs: string;
  adresa: string;
  status: "de trimis" | "trimis";
};

export const cadouriDeTrimis: CadouRow[] = [
  { client: "FitZone Store SRL", produs: "Set benzi elastice", adresa: "Cluj-Napoca", status: "de trimis" },
  { client: "HomeDecor Plus", produs: "Lumânare parfumată", adresa: "București", status: "trimis" },
  { client: "BabyCare Comfort", produs: "Body bumbac", adresa: "Timișoara", status: "de trimis" },
  { client: "GreenGarden Deco", produs: "Ghiveci decorativ", adresa: "Iași", status: "de trimis" },
];
