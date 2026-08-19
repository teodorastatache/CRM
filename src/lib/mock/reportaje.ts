import { employees } from "./shared";

export type RaportZilnicAngajat = {
  data: string;
  apeluri: number;
  discutiiClienti: number;
  recenzii: number;
  listari: number;
  suportRezolvat: number;
};

export type RaportAngajat = {
  angajatId: string;
  angajat: string;
  rol: string;
  istoric: RaportZilnicAngajat[];
};

function genIstoric(seed: number): RaportZilnicAngajat[] {
  const zile = ["12 aug", "13 aug", "14 aug", "15 aug", "16 aug", "17 aug"];
  return zile.map((data, i) => ({
    data,
    apeluri: 20 + ((seed + i * 3) % 25),
    discutiiClienti: 10 + ((seed + i * 2) % 14),
    recenzii: (seed + i) % 6,
    listari: (seed + i * 2) % 8,
    suportRezolvat: 2 + ((seed + i) % 9),
  }));
}

export const reportajeAngajati: RaportAngajat[] = employees.map((emp, i) => ({
  angajatId: emp.id,
  angajat: emp.name,
  rol: emp.role,
  istoric: genIstoric(i * 4 + 3),
}));
