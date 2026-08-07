# EquityPulse TW

Vue 3 + Vite Taiwan stock market dashboard.

## GitHub Pages

The project includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.
It deploys the `main` branch to:

`https://wafflefrank.github.io/_Stock-Web/`

In the repository settings, set **Pages → Build and deployment → Source** to
**GitHub Actions**. Every push to `main` will then build and publish the site.

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

## Stack

- Vue 3
- Vite
- Pinia
- Vitest
- Lucide Vue icons

## Taiwan Data

The Pinia store reads through `src/services/taiwanMarketApi.js`.

- Primary source: FinMind `TaiwanStockPrice`
- Optional token: `VITE_FINMIND_TOKEN`
- Fallback: local demo data for Taiwan watchlist stocks
