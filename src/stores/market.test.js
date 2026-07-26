import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMarketStore } from './market'

const finMindPayload = {
  status: 200,
  msg: 'success',
  data: [
    {
      date: '2026-07-23',
      stock_id: '2330',
      Trading_Volume: 1000,
      Trading_money: 1120000,
      close: 1120
    },
    {
      date: '2026-07-24',
      stock_id: '2330',
      Trading_Volume: 1200,
      Trading_money: 1368000,
      close: 1140
    }
  ]
}

describe('market store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('selects the default Taiwan stock snapshot', () => {
    const market = useMarketStore()

    expect(market.selectedStock.symbol).toBe('2330')
    expect(market.selectedStock.company).toBe('台積電')
  })

  it('changes the selected stock when the symbol exists', () => {
    const market = useMarketStore()

    market.selectSymbol('2317')

    expect(market.selectedSymbol).toBe('2317')
    expect(market.selectedStock.company).toBe('鴻海')
  })

  it('calculates market breadth from advancing Taiwan stocks', () => {
    const market = useMarketStore()

    expect(market.marketBreadth).toBe(67)
  })

  it('loads FinMind watchlist data through the service layer', async () => {
    const market = useMarketStore()
    market.watchlistSymbols = ['2330']
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => finMindPayload
    })
    const indexFetcher = vi.fn().mockRejectedValue(new Error('offline indices'))

    await market.refreshPrices({ fetcher, indexFetcher, startDate: '2026-07-01' })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(market.refreshCount).toBe(1)
    expect(market.dataMode).toBe('live')
    expect(market.selectedStock.price).toBe(1140)
    expect(market.selectedStock.change).toBe(1.79)
  })

  it('suggests known Taiwan stocks by company name', () => {
    const market = useMarketStore()

    market.setSearchQuery('廣達')

    expect(market.searchSuggestions[0]).toMatchObject({
      symbol: '2382',
      company: '廣達'
    })
  })

  it('selects an existing stock when searching by symbol', async () => {
    const market = useMarketStore()

    market.selectSymbol('2412')
    market.setSearchQuery('2330')
    await market.searchAndSelectStock()

    expect(market.selectedSymbol).toBe('2330')
    expect(market.selectedStock.company).toBe('台積電')
    expect(market.searchMessage).toContain('已切換')
  })

  it('adds a searched stock to the watchlist', async () => {
    const market = useMarketStore()
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { date: '2026-07-23', close: 310, Trading_Volume: 1000, Trading_money: 310000 },
          { date: '2026-07-24', close: 320, Trading_Volume: 1200, Trading_money: 384000 }
        ]
      })
    })

    await market.searchAndSelectStock('廣達', { fetcher, startDate: '2026-07-01' })

    expect(market.selectedSymbol).toBe('2382')
    expect(market.selectedStock.company).toBe('廣達')
    expect(market.stocks[0].symbol).toBe('2382')
    expect(market.searchMessage).toContain('已加入')
  })
})
