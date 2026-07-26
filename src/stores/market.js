import { defineStore } from 'pinia'
import {
  STOCK_DIRECTORY,
  TAIWAN_WATCHLIST,
  fetchMarketIndices,
  fetchTaiwanStock,
  fetchTaiwanWatchlist,
  getFallbackHeadlineSignals,
  getFallbackSectorFlows,
  getFallbackTaiwanIndices,
  getFallbackTaiwanStocks
} from '../services/taiwanMarketApi'

const priceFormatter = new Intl.NumberFormat('zh-TW', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const compactFormatter = new Intl.NumberFormat('zh-TW', {
  notation: 'compact',
  maximumFractionDigits: 1
})

const timeFormatter = new Intl.DateTimeFormat('zh-TW', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Taipei',
  timeZoneName: 'short'
})

const normalizedText = (value) => String(value ?? '').trim().toLowerCase()

export const useMarketStore = defineStore('market', {
  state: () => ({
    selectedSymbol: '2330',
    watchlistSymbols: [...TAIWAN_WATCHLIST],
    searchQuery: '',
    searchMessage: '',
    isSearching: false,
    refreshCount: 0,
    isLoading: false,
    dataMode: 'fallback',
    dataSource: '示範資料',
    lastError: '',
    lastUpdated: new Date('2026-07-24T13:30:00+08:00'),
    indices: getFallbackTaiwanIndices(),
    stocks: getFallbackTaiwanStocks(),
    sectorFlows: getFallbackSectorFlows(),
    headlineSignals: getFallbackHeadlineSignals()
  }),
  getters: {
    selectedStock: (state) =>
      state.stocks.find((stock) => stock.symbol === state.selectedSymbol) ?? state.stocks[0],
    advancingStocks: (state) => state.stocks.filter((stock) => stock.change > 0),
    decliningStocks: (state) => state.stocks.filter((stock) => stock.change < 0),
    marketBreadth() {
      return this.stocks.length
        ? Math.round((this.advancingStocks.length / this.stocks.length) * 100)
        : 0
    },
    strongestStock: (state) => [...state.stocks].sort((a, b) => b.change - a.change)[0],
    weakestStock: (state) => [...state.stocks].sort((a, b) => a.change - b.change)[0],
    lastUpdatedLabel: (state) => timeFormatter.format(state.lastUpdated),
    sourceTone: (state) => {
      if (state.isLoading) return 'warning'
      return state.dataMode === 'live' ? 'positive' : 'warning'
    },
    sourceLabel: (state) => {
      if (state.isLoading) return '同步中'
      return state.dataMode === 'live' ? 'FinMind 已同步' : '示範資料'
    },
    searchSuggestions: (state) => {
      const query = normalizedText(state.searchQuery)

      if (!query) {
        return []
      }

      const loadedStocks = state.stocks.map((stock) => ({
        symbol: stock.symbol,
        company: stock.company,
        sector: stock.sector,
        signal: stock.signal,
        loaded: true
      }))
      const knownStocks = STOCK_DIRECTORY.map((stock) => ({
        ...stock,
        loaded: state.stocks.some((loadedStock) => loadedStock.symbol === stock.symbol)
      }))
      const uniqueStocks = new Map()
      const mergedStocks = [...loadedStocks, ...knownStocks]

      mergedStocks.forEach((stock) => {
        if (!uniqueStocks.has(stock.symbol)) {
          uniqueStocks.set(stock.symbol, stock)
        }
      })

      return [...uniqueStocks.values()]
        .filter((stock) =>
          [stock.symbol, stock.company, stock.sector, stock.signal]
            .map(normalizedText)
            .some((value) => value.includes(query))
        )
        .slice(0, 6)
    }
  },
  actions: {
    setSearchQuery(value) {
      this.searchQuery = value
      this.searchMessage = ''
    },
    clearSearchMessage() {
      this.searchMessage = ''
    },
    selectSymbol(symbol) {
      if (this.stocks.some((stock) => stock.symbol === symbol)) {
        this.selectedSymbol = symbol
      }
    },
    async loadTaiwanMarketData(options = {}) {
      this.isLoading = true
      this.lastError = ''

      const [stocksResult, indicesResult] = await Promise.allSettled([
        fetchTaiwanWatchlist({
          symbols: this.watchlistSymbols,
          token: options.token ?? import.meta.env?.VITE_FINMIND_TOKEN,
          startDate: options.startDate,
          fetcher: options.fetcher
        }),
        fetchMarketIndices({
          fetcher: options.indexFetcher ?? options.fetcher ?? fetch
        })
      ])

      if (indicesResult.status === 'fulfilled') {
        this.indices = indicesResult.value
      }

      try {
        if (stocksResult.status === 'rejected') {
          throw stocksResult.reason
        }

        this.stocks = stocksResult.value
        this.dataMode = 'live'
        this.dataSource = 'FinMind TaiwanStockPrice'
        this.lastUpdated = new Date()

        if (!this.stocks.some((stock) => stock.symbol === this.selectedSymbol)) {
          this.selectedSymbol = this.stocks[0]?.symbol ?? '2330'
        }
      } catch (error) {
        this.dataMode = 'fallback'
        this.dataSource = '示範資料'
        this.lastError = error instanceof Error ? error.message : '台股資料同步失敗'
      } finally {
        this.isLoading = false
      }
    },
    async refreshPrices(options = {}) {
      this.refreshCount += 1
      await this.loadTaiwanMarketData(options)
    },
    async searchAndSelectStock(query = this.searchQuery, options = {}) {
      const normalizedQuery = normalizedText(query)

      if (!normalizedQuery) {
        return false
      }

      const existingStock = this.stocks.find(
        (stock) =>
          normalizedText(stock.symbol) === normalizedQuery ||
          normalizedText(stock.company) === normalizedQuery
      )

      if (existingStock) {
        this.selectedSymbol = existingStock.symbol
        this.searchQuery = ''
        this.searchMessage = `已切換到 ${existingStock.symbol} ${existingStock.company}`
        return true
      }

      const directoryMatch =
        STOCK_DIRECTORY.find(
          (stock) =>
            normalizedText(stock.symbol) === normalizedQuery ||
            normalizedText(stock.company) === normalizedQuery
        ) ?? this.searchSuggestions[0]
      const symbol = directoryMatch?.symbol ?? (/^\d{4}$/.test(normalizedQuery) ? normalizedQuery : '')

      if (!symbol) {
        this.searchMessage = `找不到「${query}」對應的台股代號`
        return false
      }

      return Boolean(await this.addStockBySymbol(symbol, options))
    },
    async addStockBySymbol(symbol, options = {}) {
      this.isSearching = true
      this.searchMessage = `查詢 ${symbol} 中`

      try {
        const stock = await fetchTaiwanStock(symbol, {
          token: options.token ?? import.meta.env?.VITE_FINMIND_TOKEN,
          startDate: options.startDate,
          fetcher: options.fetcher
        })
        const stockIndex = this.stocks.findIndex((item) => item.symbol === stock.symbol)

        if (stockIndex >= 0) {
          this.stocks.splice(stockIndex, 1, stock)
        } else {
          this.stocks.unshift(stock)
        }

        if (!this.watchlistSymbols.includes(stock.symbol)) {
          this.watchlistSymbols.unshift(stock.symbol)
        }

        this.selectedSymbol = stock.symbol
        this.dataMode = 'live'
        this.dataSource = 'FinMind TaiwanStockPrice'
        this.lastUpdated = new Date()
        this.searchQuery = ''
        this.searchMessage = `已加入 ${stock.symbol} ${stock.company}`
        return stock
      } catch (error) {
        this.lastError = error instanceof Error ? error.message : '台股資料查詢失敗'
        this.searchMessage = `找不到 ${symbol} 的可用股價資料`
        return null
      } finally {
        this.isSearching = false
      }
    },
    formatPrice(value) {
      return `NT$${priceFormatter.format(value)}`
    },
    formatCompact(value) {
      return compactFormatter.format(value)
    }
  }
})
