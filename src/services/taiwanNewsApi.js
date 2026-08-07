import axios from 'axios'

export const YAHOO_TAIWAN_MARKET_RSS_URL = 'https://tw.stock.yahoo.com/rss?category=tw-market'
export const LOCAL_TAIWAN_NEWS_ENDPOINT = '/api/news/tw-market'

export const FALLBACK_TAIWAN_FINANCE_NEWS = [
  {
    id: 'fallback-ai-supply-chain',
    title: 'AI supply chain keeps Taiwan market volume concentrated',
    summary:
      'Large-cap electronics remain the main watch area as investors track order momentum, yields, and overseas futures.',
    source: 'EquityPulse TW',
    url: 'https://tw.stock.yahoo.com/news/',
    publishedAt: '2026-07-24T09:30:00+08:00'
  },
  {
    id: 'fallback-financials',
    title: 'Financial stocks stay defensive while index volatility expands',
    summary:
      'Insurance and banking names are watched for dividend yield support and sector rotation during intraday pullbacks.',
    source: 'EquityPulse TW',
    url: 'https://tw.stock.yahoo.com/news/',
    publishedAt: '2026-07-24T10:10:00+08:00'
  },
  {
    id: 'fallback-tpex',
    title: 'TPEx sentiment follows small-cap liquidity and IC design names',
    summary:
      'Traders are comparing OTC breadth with electronics momentum before adding exposure to higher beta groups.',
    source: 'EquityPulse TW',
    url: 'https://tw.stock.yahoo.com/news/',
    publishedAt: '2026-07-24T10:45:00+08:00'
  }
]

export async function fetchTaiwanFinanceNews({
  endpoint = import.meta.env?.VITE_TAIWAN_NEWS_ENDPOINT ?? LOCAL_TAIWAN_NEWS_ENDPOINT,
  fetcher
} = {}) {
  const candidates = buildNewsEndpointCandidates(endpoint)

  for (const url of candidates) {
    try {
      const text = await requestText(url, { fetcher })
      const news = parseTaiwanFinanceNewsRss(text)

      if (news.length > 0) {
        return news
      }
    } catch {
      // Keep trying fallback endpoints before using static fallback news.
    }
  }

  return getFallbackTaiwanFinanceNews()
}

export function parseTaiwanFinanceNewsRss(xmlText) {
  if (!xmlText || typeof DOMParser === 'undefined') {
    return []
  }

  const document = new DOMParser().parseFromString(xmlText, 'text/xml')

  if (document.querySelector('parsererror')) {
    return []
  }

  return Array.from(document.querySelectorAll('item'))
    .map((item, index) => {
      const title = readXmlText(item, 'title')
      const url = readXmlText(item, 'link')
      const summary = cleanNewsSummary(readXmlText(item, 'description'))
      const publishedAt = parseNewsDate(readXmlText(item, 'pubDate'))
      const source = readXmlText(item, 'source') || 'Yahoo Taiwan Stock'

      return {
        id: readXmlText(item, 'guid') || url || `${title}-${index}`,
        title,
        summary,
        source,
        url,
        publishedAt
      }
    })
    .filter((item) => item.title && item.url)
    .slice(0, 8)
}

export function getFallbackTaiwanFinanceNews() {
  return FALLBACK_TAIWAN_FINANCE_NEWS.map((item) => ({ ...item }))
}

function buildNewsEndpointCandidates(endpoint) {
  const urls = [endpoint]

  if (endpoint !== YAHOO_TAIWAN_MARKET_RSS_URL) {
    urls.push(YAHOO_TAIWAN_MARKET_RSS_URL)
  }

  urls.push(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(YAHOO_TAIWAN_MARKET_RSS_URL)}`
  )

  return [...new Set(urls)].filter(Boolean)
}

async function requestText(url, { fetcher } = {}) {
  if (fetcher) {
    const response = await fetcher(url)

    if (!response.ok) {
      throw new Error(`Taiwan finance news request failed: ${response.status}`)
    }

    return response.text()
  }

  const response = await axios.get(url, {
    responseType: 'text'
  })

  return typeof response.data === 'string' ? response.data : String(response.data ?? '')
}

function readXmlText(node, selector) {
  return node.querySelector(selector)?.textContent?.trim() ?? ''
}

function cleanNewsSummary(value) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

function parseNewsDate(value) {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? '' : new Date(timestamp).toISOString()
}
