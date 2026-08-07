import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMarketStore } from './market'

function mockFinMind(data) {
  return {
    ok: true,
    json: async () => ({ data })
  }
}

describe('market store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with TSMC selected', () => {
    const market = useMarketStore()

    expect(market.selectedStock).toMatchObject({
      symbol: '2330',
      company: '台積電'
    })
  })

  it('can switch to a stock already shown on the page', () => {
    const market = useMarketStore()

    market.selectSymbol('2317')

    expect(market.selectedStock.company).toBe('鴻海')
  })

  it('can search 勤誠 by company name and select 8210', async () => {
    const market = useMarketStore()
    const fetcher = vi.fn(async (url) => {
      if (String(url).includes('TaiwanStockInfo')) {
        return mockFinMind([
          {
            industry_category: '電腦及週邊設備業',
            stock_id: '8210',
            stock_name: '勤誠'
          }
        ])
      }

      return mockFinMind([
        { date: '2026-07-23', close: 460, Trading_Volume: 1000, Trading_money: 460000 },
        { date: '2026-07-24', close: 475, Trading_Volume: 1200, Trading_money: 570000 }
      ])
    })

    await market.searchAndSelectStock('勤誠', { fetcher, startDate: '2026-07-01' })

    expect(market.selectedStock).toMatchObject({
      symbol: '8210',
      company: '勤誠',
      price: 475
    })
  })
})
