export const FINMIND_ENDPOINT = 'https://api.finmindtrade.com/api/v4/data'

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
    { symbol: 'TAIEX', label: '加權指數', value: 23584.82, change: 0.86 },
    { symbol: 'TPEx', label: '櫃買指數', value: 263.14, change: 0.41 },
    { symbol: 'ELEC', label: '電子類指', value: 1289.44, change: 1.12 },
    { symbol: 'FIN', label: '金融保險', value: 2134.61, change: -0.18 }
  ]
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

export function buildFinMindUrl(symbol, { startDate, token } = {}) {
  const params = new URLSearchParams({
    dataset: 'TaiwanStockPrice',
    data_id: symbol,
    start_date: startDate ?? getDefaultStartDate()
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
        const response = await fetcher(buildFinMindUrl(symbol, { startDate, token }))

        if (!response.ok) {
          throw new Error(`FinMind request failed: ${response.status}`)
        }

        const payload = await response.json()
        const rows = Array.isArray(payload.data) ? payload.data : []

        return rows.length ? mapFinMindRowsToStock(symbol, rows) : null
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

export function mapFinMindRowsToStock(symbol, rows) {
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
  const profile = STOCK_PROFILES[symbol] ?? {
    company: symbol,
    sector: '台股',
    signal: '同步資料'
  }

  return {
    symbol,
    company: profile.company,
    price: roundPrice(close),
    change,
    volume: Number(last.Trading_Volume ?? 0),
    tradingValue: Number(last.Trading_money ?? 0),
    sector: profile.sector,
    signal: profile.signal,
    sparkline: sortedRows.slice(-11).map((row) => roundPrice(Number(row.close))),
    asOfDate: last.date
  }
}

function getDefaultStartDate() {
  const date = new Date()
  date.setDate(date.getDate() - 45)
  return date.toISOString().slice(0, 10)
}

function roundPrice(value) {
  return Number(value.toFixed(2))
}
