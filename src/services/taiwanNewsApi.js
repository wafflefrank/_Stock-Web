import axios from 'axios'

export const YAHOO_TAIWAN_MARKET_RSS_URL = 'https://tw.finance.yahoo.com/rss?category=tw-market'
export const LEGACY_YAHOO_TAIWAN_MARKET_RSS_URL = 'https://tw.stock.yahoo.com/rss?category=tw-market'
export const LOCAL_TAIWAN_NEWS_ENDPOINT = '/api/news/tw-market'
export const STATIC_TAIWAN_NEWS_ENDPOINT = `${import.meta.env?.BASE_URL ?? '/'}news.json`

export const FALLBACK_TAIWAN_FINANCE_NEWS = []

export async function fetchTaiwanFinanceNews({
  endpoint = import.meta.env?.VITE_TAIWAN_NEWS_ENDPOINT ?? (import.meta.env?.PROD ? STATIC_TAIWAN_NEWS_ENDPOINT : LOCAL_TAIWAN_NEWS_ENDPOINT),
  fetcher
} = {}) {
  const candidates = buildNewsEndpointCandidates(endpoint)

  for (const url of candidates) {
    try {
      const text = await requestText(url, { fetcher })
      const rssNews = parseTaiwanFinanceNewsRss(text)
      const news = rssNews.length ? rssNews : parseTaiwanFinanceNewsJson(text)
      if (news.length > 0) return news
    } catch (error) {
      console.warn('Taiwan finance news request failed:', url, error)
    }
  }

  return getFallbackTaiwanFinanceNews()
}

function parseTaiwanFinanceNewsJson(text) {
  try {
    const data = JSON.parse(text)
    return Array.isArray(data) ? data.filter((item) => item?.title && item?.url).slice(0, 8) : []
  } catch {
    return []
  }
}

export function parseTaiwanFinanceNewsRss(xmlText) {
  if (!xmlText || typeof DOMParser === 'undefined') return []
  const document = new DOMParser().parseFromString(xmlText, 'text/xml')
  if (document.querySelector('parsererror')) return []

  return Array.from(document.querySelectorAll('item'))
    .map((item, index) => {
      const title = readXmlText(item, 'title')
      const url = readXmlText(item, 'link')
      return {
        id: readXmlText(item, 'guid') || url || `${title}-${index}`,
        title,
        summary: cleanNewsSummary(readXmlText(item, 'description')),
        source: readXmlText(item, 'source') || 'Yahoo Taiwan Stock',
        url,
        publishedAt: parseNewsDate(readXmlText(item, 'pubDate'))
      }
    })
    .filter((item) => item.title && item.url)
    .slice(0, 8)
}

export function getFallbackTaiwanFinanceNews() {
  return FALLBACK_TAIWAN_FINANCE_NEWS.map((item) => ({ ...item }))
}

function buildNewsEndpointCandidates(endpoint) {
  const cacheBustedEndpoint = endpoint.includes('news.json')
    ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}_=${Date.now()}`
    : endpoint
  const rssUrl = `${YAHOO_TAIWAN_MARKET_RSS_URL}&_=${Date.now()}`
  const legacyRssUrl = `${LEGACY_YAHOO_TAIWAN_MARKET_RSS_URL}&_=${Date.now()}`
  const encoded = encodeURIComponent(rssUrl)
  const legacyEncoded = encodeURIComponent(legacyRssUrl)
  return [...new Set([
    cacheBustedEndpoint,
    `https://api.allorigins.win/raw?url=${encoded}`,
    `https://api.codetabs.com/v1/proxy?quest=${encoded}`,
    `https://api.allorigins.win/raw?url=${legacyEncoded}`,
    `https://api.codetabs.com/v1/proxy?quest=${legacyEncoded}`
  ])].filter(Boolean)
}

async function requestText(url, { fetcher } = {}) {
  if (fetcher) {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    let response
    try {
      response = await fetcher(url, { signal: controller.signal, cache: 'no-store' })
    } finally {
      window.clearTimeout(timeout)
    }
    if (!response.ok) throw new Error(`Taiwan finance news request failed: ${response.status}`)
    return response.text()
  }
  const response = await axios.get(url, {
    responseType: 'text',
    timeout: 8000,
    headers: { 'Cache-Control': 'no-cache' }
  })
  return typeof response.data === 'string' ? response.data : String(response.data ?? '')
}

function readXmlText(node, selector) {
  return node.querySelector(selector)?.textContent?.trim() ?? ''
}

function cleanNewsSummary(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
}

function parseNewsDate(value) {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? '' : new Date(timestamp).toISOString()
}
