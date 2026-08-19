export type Employee = {
  id: string;
  name: string;
  role: string;
};

export const employees: Employee[] = [
  { id: "emp-1", name: "Andreea Popescu", role: "Call Center" },
  { id: "emp-2", name: "Mihai Ionescu", role: "Call Center" },
  { id: "emp-3", name: "Cristina Dumitru", role: "Listări & Recenzii" },
  { id: "emp-4", name: "Alexandra Radu", role: "Suport clienți" },
  { id: "emp-5", name: "Bogdan Stancu", role: "Fulfillment" },
  { id: "emp-6", name: "Elena Marinescu", role: "Listări & Recenzii" },
  { id: "emp-7", name: "Vlad Constantin", role: "Call Center" },
];

export type ClientCompany = {
  id: string;
  name: string;
};

export const fulfillmentClients: ClientCompany[] = [
  { id: "cl-1", name: "FitZone Store SRL" },
  { id: "cl-2", name: "HomeDecor Plus" },
  { id: "cl-3", name: "BabyCare Comfort" },
  { id: "cl-4", name: "PetLux SRL" },
  { id: "cl-5", name: "TechGadget Hub" },
];

export const callCenterClients: ClientCompany[] = [
  { id: "cl-1", name: "FitZone Store SRL" },
  { id: "cl-2", name: "HomeDecor Plus" },
  { id: "cl-3", name: "BabyCare Comfort" },
  { id: "cl-6", name: "GreenGarden Deco" },
];
