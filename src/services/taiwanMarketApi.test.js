import { describe, expect, it, vi } from 'vitest'
import {
  buildFinMindDatasetUrl,
  buildFinMindUrl,
  buildFinMindStockInfoUrl,
  fetchMarketIndices,
  fetchTaiwanStockFundamentals,
  fetchTaiwanStockHistory,
  fetchTaiwanWatchlist,
  getTaiwanStockProfile,
  mapFinMindRowsToHistory,
  mapFinMindRowsToStock
} from './taiwanMarketApi'

describe('taiwanMarketApi', () => {
  it('builds a FinMind TaiwanStockPrice URL with an optional token', () => {
    const url = buildFinMindUrl('2330', {
      startDate: '2026-07-01',
      endDate: '2026-07-24',
      token: 'demo-token'
    })

    expect(url).toContain('dataset=TaiwanStockPrice')
    expect(url).toContain('data_id=2330')
    expect(url).toContain('start_date=2026-07-01')
    expect(url).toContain('end_date=2026-07-24')
    expect(url).toContain('token=demo-token')
  })

  it('builds a FinMind TaiwanStockInfo URL for company profiles', () => {
    const url = buildFinMindStockInfoUrl('6197', { token: 'demo-token' })

    expect(url).toContain('dataset=TaiwanStockInfo')
    expect(url).toContain('data_id=6197')
    expect(url).toContain('token=demo-token')
  })

  it('builds a generic FinMind dataset URL', () => {
    const url = buildFinMindDatasetUrl('TaiwanStockPER', '2330', {
      startDate: '2026-07-01',
      endDate: '2026-07-24'
    })

    expect(url).toContain('dataset=TaiwanStockPER')
    expect(url).toContain('data_id=2330')
    expect(url).toContain('start_date=2026-07-01')
    expect(url).toContain('end_date=2026-07-24')
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
    expect(stock.priceHistory).toEqual([
      { date: '2026-07-23', open: 1120, high: 1120, low: 1120, close: 1120, volume: 1000 },
      { date: '2026-07-24', open: 1140, high: 1140, low: 1140, close: 1140, volume: 1200 }
    ])
  })

  it('maps FinMind rows into sorted close-price chart history', () => {
    const history = mapFinMindRowsToHistory([
      { date: '2026-07-24', open: 1130, max: 1150, min: 1125, close: 1140, Trading_Volume: 1200 },
      { date: '2026-07-23', open: 1110, max: 1128, min: 1105, close: 1120, Trading_Volume: 1000 }
    ])

    expect(history).toEqual([
      { date: '2026-07-23', open: 1110, high: 1128, low: 1105, close: 1120, volume: 1000 },
      { date: '2026-07-24', open: 1130, high: 1150, low: 1125, close: 1140, volume: 1200 }
    ])
  })

  it('fetches a selected Taiwan stock history range from FinMind', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { date: '2026-07-20', close: 1100, Trading_Volume: 800 },
          { date: '2026-07-21', close: 1110, Trading_Volume: 900 },
          { date: '2026-07-22', close: 1120, Trading_Volume: 1000 },
          { date: '2026-07-23', close: 1130, Trading_Volume: 1100 },
          { date: '2026-07-24', close: 1140, Trading_Volume: 1200 },
          { date: '2026-07-25', close: 1150, Trading_Volume: 1300 }
        ]
      })
    })

    const history = await fetchTaiwanStockHistory('2330', {
      range: '5D',
      endDate: '2026-07-25',
      fetcher
    })

    expect(fetcher.mock.calls[0][0]).toContain('start_date=2026-07-11')
    expect(fetcher.mock.calls[0][0]).toContain('end_date=2026-07-25')
    expect(history).toHaveLength(5)
    expect(history[0].date).toBe('2026-07-21')
    expect(history.at(-1).close).toBe(1150)
  })

  it('returns only the latest close row for the 1D chart', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: Array.from({ length: 12 }, (_, index) => ({
          date: `2026-07-${String(index + 10).padStart(2, '0')}`,
          close: 1100 + index * 5,
          Trading_Volume: 1000 + index
        }))
      })
    })

    const history = await fetchTaiwanStockHistory('2330', {
      range: '1D',
      endDate: '2026-07-25',
      fetcher
    })

    expect(fetcher.mock.calls[0][0]).toContain('start_date=2026-07-15')
    expect(fetcher.mock.calls[0][0]).toContain('end_date=2026-07-25')
    expect(history).toHaveLength(1)
    expect(history.at(-1).date).toBe('2026-07-21')
  })

  it('fetches PER, dividend, and derived market cap for stock details', async () => {
    const fetcher = vi.fn(async (url) => {
      if (String(url).includes('TaiwanStockPER')) {
        return {
          ok: true,
          json: async () => ({
            data: [
              { date: '2026-07-24', stock_id: '2330', PER: 31.59, PBR: 10.34, dividend_yield: 0.94 }
            ]
          })
        }
      }

      return {
        ok: true,
        json: async () => ({
          data: [
            {
              date: '2026-06-17',
              stock_id: '2330',
              CashEarningsDistribution: 6.00003573,
              ParticipateDistributionOfTotalShares: 25932370067
            }
          ]
        })
      }
    })

    const fundamentals = await fetchTaiwanStockFundamentals('2330', {
      close: 2350,
      endDate: '2026-07-24',
      fetcher
    })

    expect(fundamentals).toMatchObject({
      per: 31.59,
      pbr: 10.34,
      dividendYield: 0.94,
      dividend: 6.00003573,
      shares: 25932370067,
      marketCap: 60941069657450
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

  it('enriches unknown stock symbols with TaiwanStockInfo company names', async () => {
    const fetcher = vi.fn(async (url) => {
      if (String(url).includes('TaiwanStockInfo')) {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                industry_category: '電子工業',
                stock_id: '6197',
                stock_name: '佳必琪',
                type: 'twse'
              },
              {
                industry_category: '電子零組件業',
                stock_id: '6197',
                stock_name: '佳必琪',
                type: 'twse'
              }
            ]
          })
        }
      }

      return {
        ok: true,
        json: async () => ({
          data: [
            { date: '2026-07-23', close: 120, Trading_Volume: 1000, Trading_money: 120000 },
            { date: '2026-07-24', close: 126, Trading_Volume: 1200, Trading_money: 151200 }
          ]
        })
      }
    })

    const [stock] = await fetchTaiwanWatchlist({
      symbols: ['6197'],
      startDate: '2026-07-01',
      fetcher
    })

    expect(stock).toMatchObject({
      symbol: '6197',
      company: '佳必琪',
      sector: '電子零組件業',
      signal: '公司資料同步',
      price: 126
    })
  })

  it('returns a fallback profile when TaiwanStockInfo has no usable row', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] })
    })

    await expect(getTaiwanStockProfile('9999', { fetcher })).resolves.toEqual({
      company: '9999',
      sector: '台股',
      signal: '同步資料'
    })
  })

  it('maps TWSE, TPEx, and Yahoo index APIs into ticker models', async () => {
    const fetcher = vi.fn(async (url) => {
      if (url === '/twse') {
        return {
          ok: true,
          json: async () => ({
            data: [
              ['115/07/24', '', '', '', '43,654.84', '-1,195.97']
            ]
          })
        }
      }

      if (url === '/tpex') {
        return {
          ok: true,
          json: async () => [
            { Date: '20260724', Close: '377.63', Change: '-14.48' }
          ]
        }
      }

      const yahooSymbol = decodeURIComponent(String(url).split('/').at(-1).split('?')[0])
      const yahooQuotes = {
        '^DJI': { live: 51815.71, closes: [52218.58, 51711.65, 51815.71] },
        '^IXIC': { live: 24974.14, closes: [25690.9, 25137.69, 24974.14] },
        '^SOX': { live: 11916.93, closes: [12410.67, 12343.84, 11916.93] }
      }
      const quote = yahooQuotes[yahooSymbol]

      return {
        ok: true,
        json: async () => ({
          chart: {
            result: [
              {
                meta: {
                  regularMarketPrice: quote.live,
                  chartPreviousClose: quote.closes.at(-2),
                  currentTradingPeriod: {
                    regular: {
                      end: Date.now() / 1000 + 3600
                    }
                  }
                },
                timestamp: [1784727000, 1784813400, 1784899800],
                indicators: {
                  quote: [
                    {
                      close: quote.closes
                    }
                  ]
                }
              }
            ]
          }
        })
      }
    })

    const indices = await fetchMarketIndices({
      fetcher,
      twseEndpoint: '/twse',
      tpexEndpoint: '/tpex',
      yahooChartEndpoint: '/yahoo'
    })

    expect(indices).toEqual([
      { symbol: 'TWII', label: '加權指數', value: 43654.84, change: -2.67 },
      { symbol: 'TPEX', label: '櫃買指數', value: 377.63, change: -3.69 },
      { symbol: 'DJI', label: '道瓊指數', value: 51711.65, change: -0.97 },
      { symbol: 'IXIC', label: '那斯達克指數', value: 25137.69, change: -2.15 },
      { symbol: 'SOX', label: '費城半導體', value: 12343.84, change: -0.54 }
    ])
  })
})
