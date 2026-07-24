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
