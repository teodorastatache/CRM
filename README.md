# Nova CRM — E-commerce Command Center

CRM local pentru administrarea vânzărilor pe mai multe canale (Shopify, eMAG Marketplace, Trendyol), a fluxurilor financiare, performanței echipei și operațiunilor de fulfillment / call center.

## Stadiu actual

**Etapa 1 (curentă):** Dashboard CEO — sumar executiv cu date demonstrative (mock):

- Vânzări ieri și lunar, defalcate pe platformă (Shopify, eMAG, Trendyol)
- Profit zilnic și lunar (venituri − cost marfă − cheltuieli operaționale)
- Recenzii obținute (firmă proprie / alți clienți) și progres țintă
- Listări realizate (azi / lunar)
- Puls azi: recenzii, listări, cadouri trimise, cereri de suport rezolvate
- Alerte: stocuri critice (zile rămase la ritmul curent de vânzare) și facturi întârziate

Restul modulelor din structura completă (Financiar, Performanță echipă, Transporturi, Liste comenzi, Rapoarte, Calculatoare Fulfillment/Call center, Reportaje angajați, Cashflow, Raport Baterii) au navigare funcțională în sidebar și pagini placeholder — urmează să fie implementate în etapele următoare, conectate la date reale.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 — temă alb-roz
- [lucide-react](https://lucide.dev) pentru iconițe

## Structura proiectului

- `src/app/page.tsx` — Dashboard CEO
- `src/app/[...slug]/page.tsx` — pagină placeholder generică pentru modulele neimplementate încă (rezolvă titlul/descrierea din `src/lib/nav.ts`)
- `src/components/` — Sidebar, KpiCard, SectionCard
- `src/lib/nav.ts` — structura completă a meniului (grupuri + secțiuni)
- `src/lib/mock-data.ts` — date demonstrative pentru dashboard
- `src/lib/format.ts` — helpere de formatare (monedă, procent, dată)

## Development

```bash
npm install
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```
