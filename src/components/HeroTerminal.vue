<script setup>
import { computed } from 'vue'
import RefreshCw from 'lucide-vue-next/dist/esm/icons/refresh-cw.js'
import ShieldCheck from 'lucide-vue-next/dist/esm/icons/shield-check.js'
import { useMarketStore } from '../stores/market'
import FinanceNewsCarousel from './FinanceNewsCarousel.vue'
import MarketChart from './MarketChart.vue'
import MetricCard from './MetricCard.vue'
import OdometerNumber from './OdometerNumber.vue'
import StockRow from './StockRow.vue'
import { scrollToCurrentStock } from '../utils/scrollToCurrentStock'

const market = useMarketStore()

const selectedTone = computed(() => (market.selectedStock.change >= 0 ? 'positive' : 'negative'))

function selectStockAndReturnTop(symbol) {
  market.selectSymbol(symbol)
  scrollToCurrentStock()
}
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__content">
      <div id="current-stock" class="hero__snapshot" aria-label="Current selected stock">
        <div class="hero__snapshot-top">
          <span>{{ market.selectedStock.symbol }}</span>
          <strong>{{ market.selectedStock.company }}</strong>
          <button
            class="icon-button"
            type="button"
            :disabled="market.isLoading"
            aria-label="Refresh Taiwan market snapshot"
            @click="market.refreshPrices"
          >
            <RefreshCw :size="18" aria-hidden="true" />
          </button>
        </div>
        <div class="hero__price-line" :class="`tone-${selectedTone}`">
          <strong>
            <OdometerNumber :value="market.selectedStock.price" :formatter="market.formatPrice" />
          </strong>
          <span>
            <OdometerNumber
              :value="market.selectedStock.change"
              :decimals="2"
              suffix="% 近一交易日"
              show-sign
            />
          </span>
        </div>
        <MarketChart
          :values="market.selectedStock.sparkline"
          :positive="market.selectedStock.change >= 0"
        />
      </div>

      <div class="hero__copy">
        <FinanceNewsCarousel />
      </div>
    </div>

    <div class="metrics-grid" aria-label="Market pulse metrics">
      <MetricCard
        label="台股強弱廣度"
        :value="`${market.marketBreadth}%`"
        :animated-value="market.marketBreadth"
        suffix="%"
        :detail="`${market.advancingStocks.length} 檔上漲 / ${market.decliningStocks.length} 檔下跌`"
        tone="positive"
      />
      <MetricCard
        label="最強權值股"
        :value="market.strongestStock.symbol"
        :detail="`${market.strongestStock.change > 0 ? '+' : ''}${market.strongestStock.change.toFixed(2)}%`"
        tone="positive"
      />
      <MetricCard
        label="承壓個股"
        :value="market.weakestStock.symbol"
        :detail="`${market.weakestStock.change.toFixed(2)}%`"
        tone="negative"
      />
      <MetricCard
        label="資料狀態"
        :value="market.lastUpdatedLabel"
        :detail="`${market.sourceLabel} · ${market.dataSource}`"
        :tone="market.sourceTone"
      />
    </div>

    <section id="watchlist" class="market-panel" aria-labelledby="watchlist-title">
      <div class="panel-heading">
        <div>
          <span class="overline">
            <ShieldCheck :size="14" aria-hidden="true" />
            Taiwan watchlist
          </span>
          <h2 id="watchlist-title">台股核心觀察清單</h2>
        </div>
        <span class="status-chip" :class="`status-chip--${market.sourceTone}`">
          {{ market.sourceLabel }}
        </span>
      </div>
      <div class="stock-table" role="list">
        <StockRow
          v-for="stock in market.stocks"
          :key="stock.symbol"
          :stock="stock"
          :active="stock.symbol === market.selectedSymbol"
          @select="selectStockAndReturnTop"
        />
      </div>
    </section>
  </section>
</template>
