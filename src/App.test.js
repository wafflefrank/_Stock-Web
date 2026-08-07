import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import App from './App.vue'

// App 一打開就會用 axios 載入股票/新聞資料。
// 測試只想確認畫面能跑，所以這裡回一包空資料，避免真的連 API。
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } })
  }
}))

// 這是你拿來手動 console.log API 的檔案，App 測試不需要它輸出。
vi.mock('./services/testMarketApi.js', () => ({}))

function mountApp() {
  return mount(App, {
    global: {
      plugins: [createPinia()]
    }
  })
}

describe('App', () => {
  it('shows the main Taiwan stock page', () => {
    const wrapper = mountApp()

    expect(wrapper.text()).toContain('EquityPulse TW')
    expect(wrapper.text()).toContain('台股財經快訊')
    expect(wrapper.text()).toContain('台股觀察清單')
  })

  it('can select a stock from the watchlist', async () => {
    const wrapper = mountApp()

    await wrapper.get('[aria-label="Select 2317"]').trigger('click')

    expect(wrapper.text()).toContain('2317')
    expect(wrapper.text()).toContain('鴻海')
  })
})
