export type ProdusTest = {
  sku: string;
  produs: string;
  furnizor: string;
  dataInceput: string;
  status: "în test" | "aprobat" | "respins";
  nota: string;
};

export const produseTest: ProdusTest[] = [
  { sku: "TST-041", produs: "Covor yoga cu model floral", furnizor: "Ningbo Sports Co.", dataInceput: "2026-08-01", status: "în test", nota: "Așteptăm feedback grup test 20 clienți" },
  { sku: "TST-042", produs: "Bandă rezistență cu manere", furnizor: "Shenzhen Fitness Ltd.", dataInceput: "2026-07-20", status: "aprobat", nota: "Conversie bună, trecem la listare" },
  { sku: "TST-043", produs: "Saltea gimnastică extra-groasă", furnizor: "Guangzhou HomeGoods", dataInceput: "2026-07-15", status: "respins", nota: "Calitate material sub așteptări" },
  { sku: "TST-044", produs: "Set gantere cauciucate", furnizor: "Hangzhou Wellness Co.", dataInceput: "2026-08-05", status: "în test", nota: "Verificare durabilitate în curs" },
  { sku: "TST-045", produs: "Prosop sport răcoritor", furnizor: "Fujian Textile Group", dataInceput: "2026-08-10", status: "în test", nota: "Prima serie de mostre ajunsă" },
];
