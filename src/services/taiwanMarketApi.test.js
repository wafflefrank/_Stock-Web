import { describe, expect, it, vi } from 'vitest'
import {
  fetchTaiwanStockDirectory,
  fetchTaiwanWatchlist,
  mapFinMindRowsToStock,
  mapTaiwanStockInfoRowsToDirectory
} from './taiwanMarketApi'

function mockFinMind(data) {
  return {
    ok: true,
    json: async () => ({ data })
  }
}

describe('taiwanMarketApi', () => {
  it('turns FinMind price rows into one stock card', () => {
    const stock = mapFinMindRowsToStock('2330', [
      { date: '2026-07-23', close: 1120, Trading_Volume: 1000, Trading_money: 1120000 },
      { date: '2026-07-24', close: 1140, Trading_Volume: 1200, Trading_money: 1368000 }
    ])

    expect(stock).toMatchObject({
      symbol: '2330',
      company: '台積電',
      price: 1140,
      change: 1.79
    })
  })

  it('turns TaiwanStockInfo rows into a searchable company directory', () => {
    const directory = mapTaiwanStockInfoRowsToDirectory([
      { industry_category: '電子工業', stock_id: '8210', stock_name: '勤誠' },
      { industry_category: '電腦及週邊設備業', stock_id: '8210', stock_name: '勤誠' }
    ])

    expect(directory[0]).toMatchObject({
      symbol: '8210',
      company: '勤誠',
      sector: '電腦及週邊設備業'
    })
  })

  it('can fetch the full company directory', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      mockFinMind([
        { industry_category: '電腦及週邊設備業', stock_id: '8210', stock_name: '勤誠' }
      ])
    )

    const directory = await fetchTaiwanStockDirectory({ fetcher })

    expect(directory[0]).toMatchObject({
      symbol: '8210',
      company: '勤誠'
    })
  })

  it('can fetch one stock and fill in its company name', async () => {
    const fetcher = vi.fn(async (url) => {
      if (String(url).includes('TaiwanStockInfo')) {
        return mockFinMind([
          { industry_category: '電子零組件業', stock_id: '6197', stock_name: '佳必琪' }
        ])
      }

      return mockFinMind([
        { date: '2026-07-23', close: 120, Trading_Volume: 1000, Trading_money: 120000 },
        { date: '2026-07-24', close: 126, Trading_Volume: 1200, Trading_money: 151200 }
      ])
    })

    const [stock] = await fetchTaiwanWatchlist({
      symbols: ['6197'],
      startDate: '2026-07-01',
      fetcher
    })

    expect(stock).toMatchObject({
      symbol: '6197',
      company: '佳必琪',
      price: 126
    })
  })
})
