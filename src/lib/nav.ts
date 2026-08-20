import {
  LayoutDashboard,
  Wallet,
  Users,
  Truck,
  ClipboardList,
  FlaskConical,
  BarChart3,
  Calculator,
  ClipboardCheck,
  Landmark,
  Plug,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  title: string;
  icon: LucideIcon;
  href?: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    items: [],
  },
  {
    title: "Financiar",
    icon: Wallet,
    items: [
      { label: "Facturi și încasări", href: "/financiar/facturi-incasari", description: "Încasări Emag, Trendyol, site, fulfillment, call center" },
      { label: "Plăți și cheltuieli lunare", href: "/financiar/plati-cheltuieli", description: "Plăți efectuate lunar și cheltuieli operaționale" },
      { label: "Buget marketing și reclamă", href: "/financiar/marketing", description: "Bugete alocate vs cheltuite pe canale" },
      { label: "Facturi de achitat", href: "/financiar/facturi-de-achitat", description: "Facturi cu scadență, urmărire termene" },
      { label: "Încasări fulfillment pe firmă", href: "/financiar/incasari-fulfillment", description: "Defalcare încasări fulfillment pentru fiecare firmă client" },
      { label: "Sincronizare bancă", href: "/financiar/sincronizare-banca", description: "Sincronizare plăți cu extrasul de cont" },
    ],
  },
  {
    title: "Performanță echipă",
    icon: Users,
    items: [
      { label: "KPI angajați", href: "/performanta/kpi-angajati", description: "Rată conversie recenzii, listări realizate, cadouri trimise" },
      { label: "KPI încasări și profit", href: "/performanta/kpi-incasari-profit" },
    ],
  },
  {
    title: "Transporturi",
    icon: Truck,
    items: [
      { label: "Transporturi", href: "/transporturi", description: "În pregătire, pe drum, finalizate" },
    ],
  },
  {
    title: "Liste comenzi",
    icon: ClipboardList,
    items: [
      { label: "Marfă (mare/vapor)", href: "/comenzi/mare" },
      { label: "Avion", href: "/comenzi/avion" },
      { label: "Pending", href: "/comenzi/pending" },
    ],
  },
  {
    title: "Liste produse test",
    icon: FlaskConical,
    items: [{ label: "Produse test", href: "/produse-test" }],
  },
  {
    title: "Rapoarte",
    icon: BarChart3,
    items: [
      { label: "Comenzi pe platforme", href: "/rapoarte/comenzi-platforme", description: "Nr. comenzi și sume pe zi, lună, per platformă" },
      { label: "Recenzii pe firmă", href: "/rapoarte/recenzii-firma", description: "Nr. recenzii per firmă și total pe zi/lună" },
      { label: "Recenzii firmă proprie", href: "/rapoarte/recenzii-noi" },
      { label: "Recenzii per angajat", href: "/rapoarte/recenzii-angajat" },
      { label: "Rotație stoc produse", href: "/rapoarte/rotatie-stoc", description: "Viteză rotație, valoare stoc mort, zile rămase de stoc" },
    ],
  },
  {
    title: "Calculatoare",
    icon: Calculator,
    items: [
      { label: "Fulfillment", href: "/calculatoare/fulfillment", description: "Contracte, fișe clienți, recepții marfă, facturare automată" },
      { label: "Call center", href: "/calculatoare/call-center", description: "Contracte, liste trimise, rată conversie, cadouri" },
    ],
  },
  {
    title: "Reportaje angajați",
    icon: ClipboardCheck,
    items: [{ label: "Raport zilnic angajați", href: "/reportaje-angajati", description: "Apeluri, discuții clienți, recenzii, listări, suport" }],
  },
  {
    title: "Cashflow",
    icon: Landmark,
    items: [{ label: "Raport cashflow", href: "/cashflow", description: "Plăți marfă China/România, alertă deficit cash" }],
  },
  {
    title: "Integrări",
    icon: Plug,
    href: "/integrari",
    items: [],
  },
];

export const flatNavItems: NavItem[] = navGroups.flatMap((group) =>
  group.href
    ? [{ label: group.title, href: group.href }, ...group.items]
    : group.items
);
