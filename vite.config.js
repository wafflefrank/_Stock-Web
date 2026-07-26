import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/news/tw-market': {
        target: 'https://tw.stock.yahoo.com',
        changeOrigin: true,
        rewrite: () => '/rss?category=tw-market'
      },
      '/api/twse/market-index': {
        target: 'https://www.twse.com.tw',
        changeOrigin: true,
        rewrite: () => '/exchangeReport/FMTQIK?response=json'
      },
      '/api/tpex/index': {
        target: 'https://www.tpex.org.tw',
        changeOrigin: true,
        rewrite: () => '/openapi/v1/tpex_index'
      },
      '/api/yahoo-finance/chart': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo-finance\/chart/, '/v8/finance/chart')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-vue-next']
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
