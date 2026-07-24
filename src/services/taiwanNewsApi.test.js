import { describe, expect, it, vi } from 'vitest'
import {
  FALLBACK_TAIWAN_FINANCE_NEWS,
  fetchTaiwanFinanceNews,
  parseTaiwanFinanceNewsRss
} from './taiwanNewsApi'

describe('taiwanNewsApi', () => {
  it('parses Taiwan finance RSS items', () => {
    const rss = `
      <rss>
        <channel>
          <item>
            <title>台股盤中翻紅</title>
            <link>https://tw.stock.yahoo.com/news/example</link>
            <description><![CDATA[<p>權值股買盤回溫。</p>]]></description>
            <pubDate>Fri, 24 Jul 2026 10:30:00 +0800</pubDate>
            <guid>example-guid</guid>
          </item>
        </channel>
      </rss>
    `

    expect(parseTaiwanFinanceNewsRss(rss)).toEqual([
      expect.objectContaining({
        id: 'example-guid',
        title: '台股盤中翻紅',
        summary: '權值股買盤回溫。',
        source: 'Yahoo Taiwan Stock',
        url: 'https://tw.stock.yahoo.com/news/example'
      })
    ])
  })

  it('returns fallback news when every endpoint fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'))

    const news = await fetchTaiwanFinanceNews({ endpoint: '/news', fetcher })

    expect(fetcher).toHaveBeenCalled()
    expect(news).toHaveLength(FALLBACK_TAIWAN_FINANCE_NEWS.length)
  })
})
