import { mkdir, readFile, writeFile } from 'node:fs/promises'

const sources = [
  'https://tw.finance.yahoo.com/rss?category=tw-market',
  'https://tw.stock.yahoo.com/rss?category=tw-market'
]

function decode(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ').trim()
}

function tag(item, name) {
  return decode(item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))?.[1] ?? '')
}

function parse(xml) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi)].map((match, index) => {
    const item = match[0]
    const title = tag(item, 'title')
    const url = tag(item, 'link')
    const published = tag(item, 'pubDate')
    return {
      id: tag(item, 'guid') || url || `${title}-${index}`,
      title,
      summary: tag(item, 'description').slice(0, 160),
      source: tag(item, 'source') || 'Yahoo Taiwan Stock',
      url,
      publishedAt: Number.isNaN(Date.parse(published)) ? '' : new Date(published).toISOString()
    }
  }).filter((item) => item.title && item.url).slice(0, 8)
}

let latest = []
for (const source of sources) {
  try {
    const response = await fetch(source, { headers: { 'user-agent': 'equitypulse-tw-news-bot/1.0' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    latest = parse(await response.text())
    if (latest.length) break
  } catch (error) {
    console.warn(`Unable to fetch ${source}: ${error.message}`)
  }
}

await mkdir('public', { recursive: true })
if (!latest.length) {
  try { latest = JSON.parse(await readFile('public/news.json', 'utf8')) } catch { /* no previous cache */ }
}
if (!latest.length) throw new Error('No news items were fetched and no previous cache exists')
await writeFile('public/news.json', `${JSON.stringify(latest, null, 2)}\n`)
console.log(`Wrote ${latest.length} news items to public/news.json`)
