export const FINMIND_ENDPOINT = 'https://api.finmindtrade.com/api/v4/data'
export const TWSE_MARKET_INDEX_ENDPOINT = '/api/twse/market-index'
export const TPEX_INDEX_ENDPOINT = '/api/tpex/index'
export const YAHOO_FINANCE_CHART_ENDPOINT = '/api/yahoo-finance/chart'

export const TAIWAN_WATCHLIST = ['2330', '2317', '2454', '2308', '2881', '2412']


export const OFFICIAL_MARKET_SOURCES = {
  twse: 'https://openapi.twse.com.tw/',
  tpex: 'https://www.tpex.org.tw/openapi/'
}

const STOCK_PROFILES = {
  '0050': { company: '元大台灣50', sector: 'ETF', signal: '大盤核心' },
  '0056': { company: '元大高股息', sector: 'ETF', signal: '收益配置' },
  1101: { company: '台泥', sector: '水泥', signal: '景氣循環' },
  1216: { company: '統一', sector: '食品', signal: '民生防禦' },
  1301: { company: '台塑', sector: '塑化', signal: '原物料觀察' },
  2002: { company: '中鋼', sector: '鋼鐵', signal: '景氣循環' },
  2303: { company: '聯電', sector: '半導體', signal: '成熟製程' },
  2330: { company: '台積電', sector: '半導體', signal: '權值強勢' },
  2357: { company: '華碩', sector: '品牌電腦', signal: '消費電子' },
  2382: { company: '廣達', sector: 'AI 伺服器', signal: 'AI 伺服器動能' },
  2317: { company: '鴻海', sector: '電子代工', signal: '量能轉強' },
  2327: { company: '國巨', sector: '被動元件', signal: '庫存循環' },
  2454: { company: '聯發科', sector: 'IC 設計', signal: '高檔整理' },
  2603: { company: '長榮', sector: '航運', signal: '運價敏感' },
  2615: { company: '萬海', sector: '航運', signal: '運價敏感' },
  2308: { company: '台達電', sector: '電源與 AI 伺服器', signal: '趨勢延伸' },
  2881: { company: '富邦金', sector: '金融保險', signal: '穩定買盤' },
  2882: { company: '國泰金', sector: '金融保險', signal: '金融權值' },
  2891: { company: '中信金', sector: '金融保險', signal: '金融權值' },
  3008: { company: '大立光', sector: '光學鏡頭', signal: '高價股觀察' },
  3711: { company: '日月光投控', sector: '半導體封測', signal: '封測循環' },
  5871: { company: '中租-KY', sector: '租賃金融', signal: '金融服務' },
  6505: { company: '台塑化', sector: '塑化', signal: '油價敏感' },
  2412: { company: '中華電', sector: '電信', signal: '防禦配置' }
}

export const STOCK_DIRECTORY = Object.entries(STOCK_PROFILES).map(([symbol, profile]) => ({
  symbol,
  ...profile
}))

const FALLBACK_STOCKS = [
  {
    symbol: '2330',
    company: '台積電',
    price: 1135,
    change: 1.34,
    volume: 31240000,
    tradingValue: 35400000000,
    sector: '半導體',
    signal: '權值強勢',
    sparkline: [1085, 1090, 1105, 1110, 1100, 1120, 1125, 1130, 1120, 1138, 1135],
    asOfDate: '2026-07-24'
  },
  {
    symbol: '2317',
    company: '鴻海',
    price: 212.5,
    change: 0.71,
    volume: 58920000,
    tradingValue: 12500000000,
    sector: '電子代工',
    signal: '量能轉強',
    sparkline: [203, 205, 206.5, 204, 208, 209.5, 210, 211, 210.5, 212, 212.5],
    asOfDate: '2026-07-24'
  },
  {
    symbol: '2454',
    company: '聯發科',
    price: 1290,
    change: -0.39,
    volume: 6820000,
    tradingValue: 8810000000,
    sector: 'IC 設計',
    signal: '高檔整理',
    sparkline: [1305, 1310, 1300, 1295, 1305, 1298, 1292, 1288, 1296, 1294, 1290],
    asOfDate: '2026-07-24'
  },
  {
    symbol: '2308',
    company: '台達電',
    price: 468,
    change: 2.18,
    volume: 15430000,
    tradingValue: 7210000000,
    sector: '電源與 AI 伺服器',
    signal: '趨勢延伸',
    sparkline: [438, 442, 448, 451, 455, 459, 462, 461, 465, 467, 468],
    asOfDate: '2026-07-24'
  },
  {
    symbol: '2881',
    company: '富邦金',
    price: 91.8,
    change: 0.22,
    volume: 24180000,
    tradingValue: 2220000000,
    sector: '金融保險',
    signal: '穩定買盤',
    sparkline: [90.8, 91, 90.9, 91.2, 91.4, 91.3, 91.5, 91.7, 91.6, 91.9, 91.8],
    asOfDate: '2026-07-24'
  },
  {
    symbol: '2412',
    company: '中華電',
    price: 126,
    change: -0.16,
    volume: 9800000,
    tradingValue: 1230000000,
    sector: '電信',
    signal: '防禦配置',
    sparkline: [126.8, 126.5, 126.6, 126.3, 126.2, 126.4, 126.1, 126.2, 125.9, 126.1, 126],
    asOfDate: '2026-07-24'
  }
]

export function getFallbackTaiwanStocks() {
  return FALLBACK_STOCKS.map((stock) => ({
    ...stock,
    sparkline: [...stock.sparkline]
  }))
}

export function getFallbackTaiwanIndices() {
  return [
    { symbol: 'TWII', label: '加權指數', value: 43654.84, change: -2.67 },
    { symbol: 'TPEX', label: '櫃買指數', value: 377.63, change: -3.69 },
    { symbol: 'DJI', label: '道瓊指數', value: 51711.65, change: -0.97 },
    { symbol: 'IXIC', label: '那斯達克指數', value: 25137.69, change: -2.15 },
    { symbol: 'SOX', label: '費城半導體', value: 12343.84, change: -0.54 }
  ]
}

export async function fetchMarketIndices({
  fetcher = fetch,
  twseEndpoint = TWSE_MARKET_INDEX_ENDPOINT,
  tpexEndpoint = TPEX_INDEX_ENDPOINT,
  yahooChartEndpoint = YAHOO_FINANCE_CHART_ENDPOINT
} = {}) {
  const fallbackIndices = getFallbackTaiwanIndices()
  const requests = await Promise.allSettled([
    fetchTwseWeightedIndex({ fetcher, endpoint: twseEndpoint }),
    fetchTpexIndex({ fetcher, endpoint: tpexEndpoint }),
    fetchYahooIndex('^DJI', {
      fetcher,
      endpoint: yahooChartEndpoint,
      symbol: 'DJI',
      label: '道瓊指數'
    }),
    fetchYahooIndex('^IXIC', {
      fetcher,
      endpoint: yahooChartEndpoint,
      symbol: 'IXIC',
      label: '那斯達克指數'
    }),
    fetchYahooIndex('^SOX', {
      fetcher,
      endpoint: yahooChartEndpoint,
      symbol: 'SOX',
      label: '費城半導體'
    })
  ])

  return requests.map((result, index) =>
    result.status === 'fulfilled' && result.value ? result.value : fallbackIndices[index]
  )
}

export function getFallbackSectorFlows() {
  return [
    { name: '半導體', value: 1.8, tone: 'positive' },
    { name: 'AI 伺服器', value: 2.4, tone: 'positive' },
    { name: '金融保險', value: 0.3, tone: 'positive' },
    { name: '航運', value: -0.6, tone: 'negative' },
    { name: '電信', value: -0.1, tone: 'negative' }
  ]
}

export function getFallbackHeadlineSignals() {
  return [
    { label: '權值股動能', value: '2330 +1.34%', tone: 'positive' },
    { label: '資金輪動', value: 'AI 伺服器續強', tone: 'positive' },
    { label: '風險提示', value: '航運轉弱', tone: 'warning' }
  ]
}

const HISTORY_RANGE_CONFIG = {
  '1D': { days: 10, limit: 1 },
  '5D': { days: 14, limit: 5 },
  '1M': { months: 1 },
  '6M': { months: 6 },
  YTD: { yearToDate: true },
  '1Y': { years: 1 },
  '5Y': { years: 5 },
  MAX: { startDate: '1994-10-01' }
}

export function buildFinMindUrl(symbol, { startDate, endDate, token } = {}) {
  return buildFinMindDatasetUrl('TaiwanStockPrice', symbol, {
    startDate: startDate ?? getDefaultStartDate(),
    endDate,
    token
  })
}

export function buildFinMindDatasetUrl(dataset, symbol, { startDate, endDate, token } = {}) {
  const params = new URLSearchParams({
    dataset,
    data_id: symbol
  })

  if (startDate) {
    params.set('start_date', startDate)
  }

  if (endDate) {
    params.set('end_date', endDate)
  }

  if (token) {
    params.set('token', token)
  }

  return `${FINMIND_ENDPOINT}?${params.toString()}`
}

export function buildFinMindStockInfoUrl(symbol, { token } = {}) {
  const params = new URLSearchParams({
    dataset: 'TaiwanStockInfo',
    data_id: symbol
  })

  if (token) {
    params.set('token', token)
  }

  return `${FINMIND_ENDPOINT}?${params.toString()}`
}

export async function fetchTaiwanWatchlist({
  symbols = TAIWAN_WATCHLIST,
  startDate,
  token,
  fetcher = fetch
} = {}) {
  const fallbackStocks = getFallbackTaiwanStocks()
  const fallbackBySymbol = new Map(fallbackStocks.map((stock) => [stock.symbol, stock]))

  const requests = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const [response, profile] = await Promise.all([
          fetcher(buildFinMindUrl(symbol, { startDate, token })),
          getTaiwanStockProfile(symbol, { token, fetcher })
        ])

        if (!response.ok) {
          throw new Error(`FinMind request failed: ${response.status}`)
        }

        const payload = await response.json()
        const rows = Array.isArray(payload.data) ? payload.data : []

        return rows.length ? mapFinMindRowsToStock(symbol, rows, profile) : null
      } catch {
        return null
      }
    })
  )

  const liveBySymbol = new Map(requests.filter(Boolean).map((stock) => [stock.symbol, stock]))

  if (liveBySymbol.size === 0) {
    throw new Error('FinMind TaiwanStockPrice returned no usable watchlist data.')
  }

  return symbols
    .map((symbol) => liveBySymbol.get(symbol) ?? fallbackBySymbol.get(symbol))
    .filter(Boolean)
}

export async function fetchTaiwanStock(symbol, options = {}) {
  const [stock] = await fetchTaiwanWatchlist({
    ...options,
    symbols: [symbol]
  })

  if (!stock) {
    throw new Error(`No Taiwan stock data for ${symbol}`)
  }

  return stock
}

export async function fetchTaiwanStockHistory(symbol, {
  range = '1M',
  endDate,
  token,
  fetcher = fetch
} = {}) {
  const rangeWindow = getHistoryRangeWindow(range, endDate)
  const response = await fetcher(
    buildFinMindUrl(symbol, {
      startDate: rangeWindow.startDate,
      endDate: rangeWindow.endDate,
      token
    })
  )

  if (!response.ok) {
    throw new Error(`FinMind history request failed: ${response.status}`)
  }

  const payload = await response.json()
  const rows = Array.isArray(payload.data) ? payload.data : []
  const history = mapFinMindRowsToHistory(rows)
  const limitedHistory = rangeWindow.limit ? history.slice(-rangeWindow.limit) : history

  if (limitedHistory.length === 0) {
    throw new Error(`No history rows for ${symbol}`)
  }

  return limitedHistory
}

export async function fetchTaiwanStockFundamentals(symbol, {
  close,
  endDate,
  token,
  fetcher = fetch
} = {}) {
  const normalizedEndDate = endDate || formatApiDate(new Date())
  const perStartDate = shiftApiDate(normalizedEndDate, { days: -45 })
  const dividendStartDate = shiftApiDate(normalizedEndDate, { years: -2 })
  const [perResult, dividendResult] = await Promise.allSettled([
    fetchFinMindDataset('TaiwanStockPER', symbol, {
      startDate: perStartDate,
      endDate: normalizedEndDate,
      token,
      fetcher
    }),
    fetchFinMindDataset('TaiwanStockDividend', symbol, {
      startDate: dividendStartDate,
      endDate: normalizedEndDate,
      token,
      fetcher
    })
  ])
  const perRows = perResult.status === 'fulfilled' ? perResult.value : []
  const dividendRows = dividendResult.status === 'fulfilled' ? dividendResult.value : []
  const latestPer = selectLatestRow(perRows)
  const latestDividend = selectLatestRow(dividendRows, 'date')
  const shares = Number(latestDividend?.ParticipateDistributionOfTotalShares)
  const closePrice = Number(close)
  const marketCap = Number.isFinite(shares) && Number.isFinite(closePrice) ? shares * closePrice : null

  return {
    per: parseOptionalNumber(latestPer?.PER),
    pbr: parseOptionalNumber(latestPer?.PBR),
    dividendYield: parseOptionalNumber(latestPer?.dividend_yield),
    dividend: parseOptionalNumber(latestDividend?.CashEarningsDistribution),
    shares: Number.isFinite(shares) ? shares : null,
    marketCap
  }
}

export async function getTaiwanStockProfile(symbol, { token, fetcher = fetch } = {}) {
  if (STOCK_PROFILES[symbol]) {
    return STOCK_PROFILES[symbol]
  }

  try {
    const response = await fetcher(buildFinMindStockInfoUrl(symbol, { token }))

    if (!response.ok) {
      throw new Error(`FinMind stock info request failed: ${response.status}`)
    }

    const payload = await response.json()
    const rows = Array.isArray(payload.data) ? payload.data : []
    const row = selectBestStockInfoRow(rows)

    if (!row?.stock_name) {
      throw new Error(`No TaiwanStockInfo profile for ${symbol}`)
    }

    return {
      company: row.stock_name,
      sector: row.industry_category || '台股',
      signal: '公司資料同步'
    }
  } catch {
    return {
      company: symbol,
      sector: '台股',
      signal: '同步資料'
    }
  }
}

export function mapFinMindRowsToStock(symbol, rows, stockProfile = STOCK_PROFILES[symbol]) {
  const sortedRows = [...rows]
    .filter((row) => Number.isFinite(Number(row.close)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))

  if (sortedRows.length === 0) {
    throw new Error(`No price rows for ${symbol}`)
  }

  const last = sortedRows.at(-1)
  const previous = sortedRows.at(-2)
  const close = Number(last.close)
  const previousClose = previous ? Number(previous.close) : close - Number(last.spread ?? 0)
  const change = previousClose
    ? Number((((close - previousClose) / previousClose) * 100).toFixed(2))
    : 0
  const profile = stockProfile ?? {
    company: symbol,
    sector: '台股',
    signal: '同步資料'
  }

  return {
    symbol,
    company: profile.company,
    price: roundPrice(close),
    change,
    open: roundPrice(Number(last.open ?? close)),
    high: roundPrice(Number(last.max ?? close)),
    low: roundPrice(Number(last.min ?? close)),
    volume: Number(last.Trading_Volume ?? 0),
    tradingValue: Number(last.Trading_money ?? 0),
    sector: profile.sector,
    signal: profile.signal,
    sparkline: sortedRows.slice(-11).map((row) => roundPrice(Number(row.close))),
    priceHistory: mapFinMindRowsToHistory(sortedRows),
    asOfDate: last.date
  }
}

export function mapFinMindRowsToHistory(rows) {
  return [...rows]
    .filter((row) => Number.isFinite(Number(row.close)) && row.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((row) => ({
      date: row.date,
      open: roundPrice(Number(row.open ?? row.close)),
      high: roundPrice(Number(row.max ?? row.close)),
      low: roundPrice(Number(row.min ?? row.close)),
      close: roundPrice(Number(row.close)),
      volume: Number(row.Trading_Volume ?? 0)
    }))
}

function selectBestStockInfoRow(rows) {
  return (
    rows.find((row) => row.industry_category && row.industry_category !== '電子工業') ??
    rows[0] ??
    null
  )
}

async function fetchFinMindDataset(dataset, symbol, { startDate, endDate, token, fetcher }) {
  const response = await fetcher(
    buildFinMindDatasetUrl(dataset, symbol, {
      startDate,
      endDate,
      token
    })
  )

  if (!response.ok) {
    throw new Error(`FinMind ${dataset} request failed: ${response.status}`)
  }

  const payload = await response.json()
  return Array.isArray(payload.data) ? payload.data : []
}

function selectLatestRow(rows, dateKey = 'date') {
  return [...rows]
    .filter((row) => row?.[dateKey])
    .sort((a, b) => String(a[dateKey]).localeCompare(String(b[dateKey])))
    .at(-1)
}

async function fetchTwseWeightedIndex({ fetcher, endpoint }) {
  const response = await fetcher(endpoint)

  if (!response.ok) {
    throw new Error(`TWSE market index request failed: ${response.status}`)
  }

  const payload = await response.json()
  const rows = Array.isArray(payload.data) ? payload.data : []
  const latest = rows.at(-1)

  if (!latest) {
    throw new Error('TWSE market index returned no rows.')
  }

  const value = parseMarketNumber(latest[4])
  const pointChange = parseMarketNumber(latest[5])

  return {
    symbol: 'TWII',
    label: '加權指數',
    value: roundPrice(value),
    change: calculateChangePercent(value, pointChange)
  }
}

async function fetchTpexIndex({ fetcher, endpoint }) {
  const response = await fetcher(endpoint)

  if (!response.ok) {
    throw new Error(`TPEx index request failed: ${response.status}`)
  }

  const rows = await response.json()
  const latest = Array.isArray(rows) ? rows.at(-1) : null

  if (!latest) {
    throw new Error('TPEx index returned no rows.')
  }

  const value = parseMarketNumber(latest.Close)
  const pointChange = parseMarketNumber(latest.Change)

  return {
    symbol: 'TPEX',
    label: '櫃買指數',
    value: roundPrice(value),
    change: calculateChangePercent(value, pointChange)
  }
}

async function fetchYahooIndex(yahooSymbol, { fetcher, endpoint, symbol, label }) {
  const response = await fetcher(buildYahooChartUrl(endpoint, yahooSymbol))

  if (!response.ok) {
    throw new Error(`Yahoo Finance index request failed: ${response.status}`)
  }

  const payload = await response.json()
  const result = payload.chart?.result?.[0]
  const selectedQuote = selectYahooCompletedDailyQuote(result)
  const meta = result?.meta
  const value = selectedQuote?.value ?? Number(meta?.regularMarketPrice)
  const previousClose = selectedQuote?.previousClose ?? Number(meta?.chartPreviousClose)

  if (!Number.isFinite(value) || !Number.isFinite(previousClose)) {
    throw new Error(`Yahoo Finance index returned no usable quote for ${yahooSymbol}.`)
  }

  const pointChange = value - previousClose

  return {
    symbol,
    label,
    value: roundPrice(value),
    change: calculateChangePercent(value, pointChange)
  }
}

function buildYahooChartUrl(endpoint, symbol) {
  const params = new URLSearchParams({
    range: '5d',
    interval: '1d'
  })

  return `${endpoint}/${encodeURIComponent(symbol)}?${params.toString()}`
}

function selectYahooCompletedDailyQuote(result) {
  const closes = result?.indicators?.quote?.[0]?.close ?? []
  const timestamps = result?.timestamp ?? []
  const latestIndex = closes.findLastIndex((value) => Number.isFinite(Number(value)))

  if (latestIndex < 0) {
    return null
  }

  const regularEnd = Number(result?.meta?.currentTradingPeriod?.regular?.end)
  const isCurrentSessionOpen = Number.isFinite(regularEnd) && Date.now() / 1000 < regularEnd
  const valueIndex = isCurrentSessionOpen && latestIndex > 0 ? latestIndex - 1 : latestIndex
  const previousIndex = valueIndex - 1
  const value = Number(closes[valueIndex])
  const previousClose = Number(closes[previousIndex])

  if (!Number.isFinite(value) || !Number.isFinite(previousClose)) {
    return null
  }

  return {
    value,
    previousClose,
    timestamp: timestamps[valueIndex]
  }
}

function calculateChangePercent(value, pointChange) {
  const previousClose = value - pointChange

  if (!Number.isFinite(previousClose) || previousClose === 0) {
    return 0
  }

  return Number(((pointChange / previousClose) * 100).toFixed(2))
}

function parseMarketNumber(value) {
  return Number(String(value ?? '').replace(/,/g, ''))
}

function getDefaultStartDate() {
  const date = new Date()
  date.setDate(date.getDate() - 45)
  return date.toISOString().slice(0, 10)
}

function getHistoryRangeWindow(range, endDate = formatApiDate(new Date())) {
  const config = HISTORY_RANGE_CONFIG[range] ?? HISTORY_RANGE_CONFIG['1M']
  const normalizedEndDate = endDate || formatApiDate(new Date())

  if (config.startDate) {
    return {
      startDate: config.startDate,
      endDate: normalizedEndDate,
      limit: config.limit
    }
  }

  if (config.yearToDate) {
    return {
      startDate: `${normalizedEndDate.slice(0, 4)}-01-01`,
      endDate: normalizedEndDate,
      limit: config.limit
    }
  }

  const date = parseApiDate(normalizedEndDate)

  if (config.years) {
    date.setUTCFullYear(date.getUTCFullYear() - config.years)
  }

  if (config.months) {
    date.setUTCMonth(date.getUTCMonth() - config.months)
  }

  if (config.days) {
    date.setUTCDate(date.getUTCDate() - config.days)
  }

  return {
    startDate: formatApiDate(date),
    endDate: normalizedEndDate,
    limit: config.limit
  }
}

function parseApiDate(value) {
  const [year, month, day] = String(value).split('-').map(Number)

  if (![year, month, day].every(Number.isFinite)) {
    return new Date()
  }

  return new Date(Date.UTC(year, month - 1, day))
}

function formatApiDate(date) {
  return date.toISOString().slice(0, 10)
}

function shiftApiDate(value, { days = 0, months = 0, years = 0 } = {}) {
  const date = parseApiDate(value)
  date.setUTCFullYear(date.getUTCFullYear() + years)
  date.setUTCMonth(date.getUTCMonth() + months)
  date.setUTCDate(date.getUTCDate() + days)
  return formatApiDate(date)
}

function parseOptionalNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function roundPrice(value) {
  return Number(value.toFixed(2))
}
