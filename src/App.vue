<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import ArrowUpRight from 'lucide-vue-next/dist/esm/icons/arrow-up-right.js'
import Gauge from 'lucide-vue-next/dist/esm/icons/gauge.js'
import RadioTower from 'lucide-vue-next/dist/esm/icons/radio-tower.js'
import Search from 'lucide-vue-next/dist/esm/icons/search.js'
import Settings2 from 'lucide-vue-next/dist/esm/icons/settings-2.js'
import HeroTerminal from './components/HeroTerminal.vue'
import MarketTicker from './components/MarketTicker.vue'
import OdometerNumber from './components/OdometerNumber.vue'
import { useMarketStore } from './stores/market'
import { scrollToCurrentStock } from './utils/scrollToCurrentStock'
import('./services/testMarketApi.js')

const market = useMarketStore()
const toast = useToast()
let refreshTimer

onMounted(() => {
  market.loadTaiwanMarketData()

  refreshTimer = window.setInterval(() => {
    market.loadTaiwanMarketData()
  }, 15 * 60 * 1000)
})

onUnmounted(() => {
  window.clearInterval(refreshTimer)
})

watch(
  () => market.searchMessage,
  (message) => {
    if (!message) {
      return
    }

    showSearchToast(message)
    market.clearSearchMessage()
  }
)

async function handleSearchSubmit() {
  const didSelect = await market.searchAndSelectStock()

  if (didSelect) {
    scrollToCurrentStock()
  }
}

async function handleSearchResultSelect(symbol) {
  const didSelect = await market.searchAndSelectStock(symbol)

  if (didSelect) {
    scrollToCurrentStock()
  }
}

function showSearchToast(message) {
  if (message.includes('查詢') && message.includes('中')) {
    return
  }

  const options = {
    timeout: 2600,
    icon: false
  }

  if (message.includes('找不到')) {
    toast.error(message, options)
    return
  }

  toast.info(message, options)
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header" aria-label="Primary navigation">
      <a class="brand-mark" href="#" aria-label="EquityPulse home">
        <span class="brand-mark__pulse"></span>
        <span>EquityPulse TW</span>
      </a>
      <nav class="site-nav" aria-label="Site sections">
        <a href="#watchlist">台股市場</a>
        <a href="#signals">訊號</a>
        <a href="#sectors">族群</a>
        <a href="#research">觀察</a>
      </nav>
      <div class="header-actions">
        <form class="search-wrapper" role="search" @submit.prevent="handleSearchSubmit">
          <label class="search-control" aria-label="Search tickers">
            <Search :size="16" aria-hidden="true" />
            <input
              type="search"
              placeholder="代號、公司、產業"
              :value="market.searchQuery"
              :aria-expanded="market.searchSuggestions.length > 0"
              @input="market.setSearchQuery($event.target.value)"
            />
          </label>
          <div
            v-if="market.searchQuery && market.searchSuggestions.length > 0"
            class="search-popover"
            aria-label="Search results"
          >
            <button
              v-for="suggestion in market.searchSuggestions"
              :key="suggestion.symbol"
              type="button"
              class="search-result"
              @click="handleSearchResultSelect(suggestion.symbol)"
            >
              <strong>{{ suggestion.symbol }}</strong>
              <span>{{ suggestion.company }}</span>
              <small>{{ suggestion.sector }}{{ suggestion.loaded ? ' · 已在清單' : '' }}</small>
            </button>
          </div>
        </form>
        <button class="icon-button" type="button" aria-label="Settings">
          <Settings2 :size="18" aria-hidden="true" />
        </button>
      </div>
    </header>

    <main>
      <MarketTicker :indices="market.indices" />
      <HeroTerminal />

      <section id="signals" class="insight-grid" aria-labelledby="signals-title">
        <div class="section-heading">
          <span class="overline">
            <RadioTower :size="14" aria-hidden="true" />
            Signal stack
          </span>
          <h2 id="signals-title">盤面正在放大的訊號</h2>
        </div>

        <article
          v-for="signal in market.headlineSignals"
          :key="signal.label"
          class="signal-card"
          :class="`signal-card--${signal.tone}`"
        >
          <span>{{ signal.label }}</span>
          <strong>{{ signal.value }}</strong>
        </article>
      </section>

      <section id="sectors" class="sector-panel" aria-labelledby="sectors-title">
        <div class="section-heading">
          <span class="overline">
            <Gauge :size="14" aria-hidden="true" />
            Sector pulse
          </span>
          <h2 id="sectors-title">台股族群資金流向</h2>
        </div>
        <div class="sector-list">
          <div
            v-for="sector in market.sectorFlows"
            :key="sector.name"
            class="sector-row"
            :class="{ 'is-negative': sector.value < 0 }"
          >
            <span>{{ sector.name }}</span>
            <div class="sector-row__track" aria-hidden="true">
              <span :style="{ width: `${Math.min(Math.abs(sector.value) * 24, 100)}%` }"></span>
            </div>
            <strong>
              <OdometerNumber :value="sector.value" :decimals="1" suffix="%" show-sign />
            </strong>
          </div>
        </div>
      </section>

      <section id="research" class="closing-band" aria-labelledby="research-title">
        <div>
          <span class="overline">Taiwan first</span>
          <h2 id="research-title">先把台股觀察清單打穩，再擴充個股與策略頁。</h2>
          <p>
            下一步可以接上個股詳情、K 線、法人買賣、月營收、警示條件與自選股管理。
          </p>
        </div>
        <a class="button button--primary" href="#watchlist">
          <ArrowUpRight :size="18" aria-hidden="true" />
          掃描權值股
        </a>
      </section>
    </main>
  </div>
</template>
