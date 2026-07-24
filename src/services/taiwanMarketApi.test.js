import { describe, expect, it, vi } from 'vitest'
import { buildFinMindUrl, fetchTaiwanWatchlist, mapFinMindRowsToStock } from './taiwanMarketApi'

describe('taiwanMarketApi', () => {
  it('builds a FinMind TaiwanStockPrice URL with an optional token', () => {
    const url = buildFinMindUrl('2330', {
      startDate: '2026-07-01',
      token: 'demo-token'
    })

    expect(url).toContain('dataset=TaiwanStockPrice')
    expect(url).toContain('data_id=2330')
    expect(url).toContain('start_date=2026-07-01')
    expect(url).toContain('token=demo-token')
  })

  it('maps FinMind rows into a Taiwan stock card model', () => {
    const stock = mapFinMindRowsToStock('2330', [
      { date: '2026-07-23', close: 1120, Trading_Volume: 1000, Trading_money: 1120000 },
      { date: '2026-07-24', close: 1140, Trading_Volume: 1200, Trading_money: 1368000 }
    ])

    expect(stock).toMatchObject({
      symbol: '2330',
      company: '台積電',
      sector: '半導體',
      price: 1140,
      change: 1.79,
      asOfDate: '2026-07-24'
    })
  })

  it('returns live stocks and preserves watchlist order', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { date: '2026-07-23', close: 1120, Trading_Volume: 1000, Trading_money: 1120000 },
          { date: '2026-07-24', close: 1140, Trading_Volume: 1200, Trading_money: 1368000 }
        ]
      })
    })

    const stocks = await fetchTaiwanWatchlist({
      symbols: ['2330'],
      startDate: '2026-07-01',
      fetcher
    })

    expect(stocks).toHaveLength(1)
    expect(stocks[0].symbol).toBe('2330')
    expect(fetcher.mock.calls[0][0]).toContain('data_id=2330')
  })
})
