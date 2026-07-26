import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'

const mountApp = () =>
  mount(App, {
    global: {
      plugins: [createPinia()]
    }
  })

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the Taiwan stock market landing page', () => {
    const wrapper = mountApp()

    expect(wrapper.text()).toContain('EquityPulse TW')
    expect(wrapper.text()).toContain('台股財經快訊')
    expect(wrapper.text()).toContain('台股觀察清單')
  })

  it('updates the hero snapshot when a Taiwan stock row is selected', async () => {
    const wrapper = mountApp()
    const foxconnButton = wrapper.get('[aria-label="Select 2317"]')

    await foxconnButton.trigger('click')

    expect(wrapper.text()).toContain('鴻海')
    expect(wrapper.text()).toContain('NT$212.50')
  })

  it('selects an existing stock from the search form submit', async () => {
    const wrapper = mountApp()

    await wrapper.get('[aria-label="Select 2412"]').trigger('click')
    expect(wrapper.text()).toContain('中華電')

    await wrapper.get('input[type="search"]').setValue('2330')
    await wrapper.get('form.search-wrapper').trigger('submit')

    expect(wrapper.text()).toContain('台積電')
    expect(wrapper.text()).toContain('NT$1,135.00')
  })
})
