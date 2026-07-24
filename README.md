# EquityPulse TW

Vue 3 + Vite landing page prototype for a dark-mode Taiwan stock market website.

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
