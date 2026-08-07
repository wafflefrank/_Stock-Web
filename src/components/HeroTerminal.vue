<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ArrowDown from 'lucide-vue-next/dist/esm/icons/arrow-down.js'
import ArrowUp from 'lucide-vue-next/dist/esm/icons/arrow-up.js'
import Check from 'lucide-vue-next/dist/esm/icons/check.js'
import Plus from 'lucide-vue-next/dist/esm/icons/plus.js'
import RefreshCw from 'lucide-vue-next/dist/esm/icons/refresh-cw.js'
import ShieldCheck from 'lucide-vue-next/dist/esm/icons/shield-check.js'
import X from 'lucide-vue-next/dist/esm/icons/x.js'
import { useMarketStore } from '../stores/market'
import FinanceNewsCarousel from './FinanceNewsCarousel.vue'
import MarketChart from './MarketChart.vue'
import OdometerNumber from './OdometerNumber.vue'
import StockRow from './StockRow.vue'
import { fetchTaiwanStockFundamentals, fetchTaiwanStockHistory } from '../services/taiwanMarketApi'

const market = useMarketStore()

const rangeOptions = [
  { key: '1D', label: '1 天' },
  { key: '5D', label: '5 天' },
  { key: '1M', label: '1 個月' },
  { key: '6M', label: '6 個月' },
  { key: 'YTD', label: '本年迄今' },
  { key: '1Y', label: '1 年' },
  { key: '5Y', label: '5 年' },
  { key: 'MAX', label: '最大' }
]

const activeRange = ref('1D')
const chartHistory = ref([])
const isChartLoading = ref(false)
const chartError = ref('')
const stockFundamentals = ref(null)
const followedSymbols = ref(new Set())
const isTrackAnimating = ref(false)
const isStockModalOpen = ref(false)
let trackAnimationTimer = 0
let chartRequestId = 0
let fundamentalsRequestId = 0

const selectedTone = computed(() => (market.selectedStock.change >= 0 ? 'positive' : 'negative'))
const selectedChartPoints = computed(() =>
  chartHistory.value.length ? chartHistory.value : getFallbackChartHistory(market.selectedStock)
)
const latestQuoteRow = computed(() => selectedChartPoints.value.at(-1) ?? market.selectedStock)
const stockDetailItems = computed(() => [
  { label: '開盤', value: formatDetailPrice(latestQuoteRow.value.open ?? market.selectedStock.open) },
  { label: '最高', value: formatDetailPrice(latestQuoteRow.value.high ?? market.selectedStock.high) },
  { label: '最低', value: formatDetailPrice(latestQuoteRow.value.low ?? market.selectedStock.low) },
  { label: '市值', value: formatMarketCap(stockFundamentals.value?.marketCap) },
  { label: '本益比', value: formatDetailNumber(stockFundamentals.value?.per) },
  { label: '股息', value: formatDetailNumber(stockFundamentals.value?.dividend) }
])
const isSelectedTracked = computed(() => followedSymbols.value.has(market.selectedStock.symbol))
const priceDelta = computed(() => {
  const price = Number(market.selectedStock.price)
  const change = Number(market.selectedStock.change)

  if (!Number.isFinite(price) || !Number.isFinite(change)) {
    return 0
  }

  const previousClose = price / (1 + change / 100)
  return price - previousClose
})
const priceDeltaLabel = computed(() => {
  const delta = priceDelta.value
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : ''
  return `${sign}${Math.abs(delta).toFixed(2)} 今天`
})
const quoteTimeLabel = computed(() =>
  market.selectedStock.asOfDate
    ? `${formatDisplayDate(market.selectedStock.asOfDate)} 收盤`
    : new Intl.DateTimeFormat('zh-TW', {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Taipei',
        timeZoneName: 'short'
      }).format(market.lastUpdated)
)

function formatHeroPrice(value) {
  return Number(value).toFixed(2)
}

function selectRange(rangeKey) {
  activeRange.value = rangeKey
}

async function loadChartHistory() {
  const requestId = ++chartRequestId
  const stock = market.selectedStock

  isChartLoading.value = true
  chartError.value = ''

  try {
    const history = await fetchTaiwanStockHistory(stock.symbol, {
      range: activeRange.value,
      endDate: stock.asOfDate,
      token: import.meta.env?.VITE_FINMIND_TOKEN
    })

    if (requestId !== chartRequestId) {
      return
    }

    chartHistory.value = history
  } catch (error) {
    if (requestId !== chartRequestId) {
      return
    }

    chartError.value = error instanceof Error ? error.message : '歷史股價資料同步失敗'
    chartHistory.value = []
  } finally {
    if (requestId === chartRequestId) {
      isChartLoading.value = false
    }
  }
}

async function loadStockFundamentals() {
  const requestId = ++fundamentalsRequestId
  const stock = market.selectedStock

  stockFundamentals.value = null

  try {
    const fundamentals = await fetchTaiwanStockFundamentals(stock.symbol, {
      close: stock.price,
      endDate: stock.asOfDate,
      token: import.meta.env?.VITE_FINMIND_TOKEN
    })

    if (requestId === fundamentalsRequestId) {
      stockFundamentals.value = fundamentals
    }
  } catch {
    if (requestId === fundamentalsRequestId) {
      stockFundamentals.value = null
    }
  }
}

function toggleTracking() {
  const nextSymbols = new Set(followedSymbols.value)

  if (nextSymbols.has(market.selectedStock.symbol)) {
    nextSymbols.delete(market.selectedStock.symbol)
  } else {
    nextSymbols.add(market.selectedStock.symbol)
  }

  followedSymbols.value = nextSymbols
  isTrackAnimating.value = true
  window.clearTimeout(trackAnimationTimer)
  trackAnimationTimer = window.setTimeout(() => {
    isTrackAnimating.value = false
  }, 420)
}

function openStockModal(symbol) {
  market.selectSymbol(symbol)
  isStockModalOpen.value = true
}

function closeStockModal() {
  isStockModalOpen.value = false
}

function getFallbackChartHistory(stock) {
  if (Array.isArray(stock.priceHistory) && stock.priceHistory.length) {
    return stock.priceHistory
  }

  const endDate = stock.asOfDate ?? new Date().toISOString().slice(0, 10)
  const end = new Date(`${endDate}T00:00:00Z`)
  const values = stock.sparkline ?? [stock.price]

  return values.map((value, index) => {
    const date = new Date(end)
    date.setUTCDate(end.getUTCDate() - (values.length - 1 - index))

    return {
      date: date.toISOString().slice(0, 10),
      close: Number(value)
    }
  })
}

function formatDisplayDate(value) {
  const [year, month, day] = String(value).split('-').map(Number)

  if (![year, month, day].every(Number.isFinite)) {
    return value
  }

  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Taipei'
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function formatDetailPrice(value) {
  return formatDetailNumber(value)
}

function formatDetailNumber(value, decimals = 2) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return '--'
  }

  return number.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

function formatMarketCap(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return '--'
  }

  if (Math.abs(number) >= 1_000_000_000_000) {
    return `${(number / 1_000_000_000_000).toFixed(2)}兆`
  }

  if (Math.abs(number) >= 100_000_000) {
    return `${(number / 100_000_000).toFixed(2)}億`
  }

  return formatDetailNumber(number, 0)
}

watch(
  () => [market.selectedStock.symbol, market.selectedStock.asOfDate, activeRange.value],
  loadChartHistory,
  { immediate: true }
)

watch(
  () => [market.selectedStock.symbol, market.selectedStock.asOfDate, market.selectedStock.price],
  loadStockFundamentals,
  { immediate: true }
)

watch(isStockModalOpen, (isOpen) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

onBeforeUnmount(() => {
  window.clearTimeout(trackAnimationTimer)

  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__content">
      <div id="current-stock" class="hero__snapshot" aria-label="Current selected stock">
        <div class="hero__snapshot-top">
          <div class="hero__stock-identity">
            <span>{{ market.selectedStock.symbol }}</span>
            <strong>{{ market.selectedStock.company }}</strong>
          </div>
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
        <div class="hero__quote-header">
          <div class="hero__quote-main">
            <div class="hero__price-line" :class="`tone-${selectedTone}`">
              <strong class="hero__price-value">
                <span class="hero__price-amount">
                  <OdometerNumber :value="market.selectedStock.price" :formatter="formatHeroPrice" />
                </span>
                <span class="hero__price-currency">TWD</span>
              </strong>
            </div>
            <p class="hero__quote-time">
              {{ quoteTimeLabel }} · {{ market.sourceLabel }}
            </p>
          </div>

          <div class="hero__quote-actions" :class="`tone-${selectedTone}`">
            <div class="hero__change-line">
              <span class="hero__change-pill">
                <ArrowUp v-if="market.selectedStock.change >= 0" :size="16" aria-hidden="true" />
                <ArrowDown v-else :size="16" aria-hidden="true" />
                <OdometerNumber
                  :value="market.selectedStock.change"
                  :decimals="2"
                  suffix="%"
                  show-sign
                />
              </span>
              <span class="hero__change-points">{{ priceDeltaLabel }}</span>
            </div>

            <button
              class="track-button"
              :class="{ 'is-tracked': isSelectedTracked, 'is-animating': isTrackAnimating }"
              type="button"
              :aria-pressed="isSelectedTracked"
              @click="toggleTracking"
            >
              <Check v-if="isSelectedTracked" :size="16" aria-hidden="true" />
              <Plus v-else :size="16" aria-hidden="true" />
              <span>{{ isSelectedTracked ? '已追蹤' : '追蹤' }}</span>
            </button>
          </div>
        </div>

        <div class="chart-range-tabs" aria-label="Chart date range">
          <button
            v-for="range in rangeOptions"
            :key="range.key"
            type="button"
            :class="{ 'is-active': activeRange === range.key }"
            @click="selectRange(range.key)"
          >
            {{ range.label }}
          </button>
        </div>

        <div class="hero__chart-panel" :aria-busy="isChartLoading">
          <span v-if="chartError" class="chart-sync-note">使用既有股價資料</span>
          <MarketChart
            :key="`${market.selectedStock.symbol}-${activeRange}`"
            :points="selectedChartPoints"
            :positive="market.selectedStock.change >= 0"
            :range="activeRange"
          />
        </div>

        <div class="stock-detail-grid" aria-label="Selected stock details">
          <div v-for="item in stockDetailItems" :key="item.label" class="stock-detail-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>

      <div class="hero__copy">
        <FinanceNewsCarousel />
      </div>
    </div>

    <section id="watchlist" class="market-panel" aria-labelledby="watchlist-title">
      <div class="panel-heading">
        <div>
          <span class="overline">
            <ShieldCheck :size="14" aria-hidden="true" />
            Taiwan watchlist
          </span>
          <h2 id="watchlist-title">台股觀察清單</h2>
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
          @select="openStockModal"
        />
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="isStockModalOpen"
        class="stock-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-modal-title"
        @click.self="closeStockModal"
      >
        <article class="stock-modal__panel">
          <header class="stock-modal__header">
            <div>
              <span class="overline">Selected stock</span>
              <h2 id="stock-modal-title">{{ market.selectedStock.symbol }} {{ market.selectedStock.company }}</h2>
              <p>{{ market.selectedStock.sector }} · {{ quoteTimeLabel }}</p>
            </div>
            <button class="icon-button" type="button" aria-label="Close stock details" @click="closeStockModal">
              <X :size="18" aria-hidden="true" />
            </button>
          </header>

          <div class="stock-modal__quote" :class="`tone-${selectedTone}`">
            <strong>
              <OdometerNumber :value="market.selectedStock.price" :formatter="formatHeroPrice" />
              <span>TWD</span>
            </strong>
            <div class="hero__change-line">
              <span class="hero__change-pill">
                <ArrowUp v-if="market.selectedStock.change >= 0" :size="16" aria-hidden="true" />
                <ArrowDown v-else :size="16" aria-hidden="true" />
                <OdometerNumber
                  :value="market.selectedStock.change"
                  :decimals="2"
                  suffix="%"
                  show-sign
                />
              </span>
              <span class="hero__change-points">{{ priceDeltaLabel }}</span>
            </div>
          </div>

          <div class="chart-range-tabs chart-range-tabs--modal" aria-label="Stock modal chart date range">
            <button
              v-for="range in rangeOptions"
              :key="range.key"
              type="button"
              :class="{ 'is-active': activeRange === range.key }"
              @click="selectRange(range.key)"
            >
              {{ range.label }}
            </button>
          </div>

          <div class="stock-modal__chart" :aria-busy="isChartLoading">
            <span v-if="chartError" class="chart-sync-note">使用既有股價資料</span>
            <MarketChart
              :key="`${market.selectedStock.symbol}-${activeRange}-modal`"
              :points="selectedChartPoints"
              :positive="market.selectedStock.change >= 0"
              :range="activeRange"
            />
          </div>

          <div class="stock-modal__details">
            <div v-for="item in stockDetailItems" :key="item.label" class="stock-detail-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </article>
      </div>
    </Teleport>
  </section>
</template>
