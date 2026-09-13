<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ExternalLink from 'lucide-vue-next/dist/esm/icons/external-link.js'
import LoaderCircle from 'lucide-vue-next/dist/esm/icons/loader-circle.js'
import Newspaper from 'lucide-vue-next/dist/esm/icons/newspaper.js'
import { A11y, Autoplay, Keyboard, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import { fetchTaiwanFinanceNews } from '../services/taiwanNewsApi'

const modules = [A11y, Autoplay, Keyboard, Pagination]
const newsItems = ref([])
const isLoading = ref(true)
const lastUpdated = ref(null)
const loadError = ref('')
let refreshTimer

const canLoop = computed(() => newsItems.value.length > 1)

async function refreshNews() {
  try {
    const latestNews = await fetchTaiwanFinanceNews()
    if (latestNews.length > 0) {
      newsItems.value = latestNews
      lastUpdated.value = new Date()
      loadError.value = ''
    } else if (!newsItems.value.length) {
      loadError.value = '目前無法取得新聞'
    }
  } catch (error) {
    loadError.value = '新聞同步失敗'
    console.warn('Taiwan finance news refresh failed:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  refreshNews()
  refreshTimer = window.setInterval(refreshNews, 5 * 60 * 1000)
})

onUnmounted(() => {
  window.clearInterval(refreshTimer)
})

function formatNewsTime(value) {
  if (!value) {
    return '即時'
  }

  return new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Taipei'
  }).format(new Date(value))
}
</script>

<template>
  <div class="news-carousel" aria-label="台股財經新聞">
    <div class="news-carousel__header">
      <span class="overline">
        <Newspaper :size="14" aria-hidden="true" />
        Taiwan finance news
      </span>
      <span class="news-carousel__badge">
        <LoaderCircle v-if="isLoading" :size="13" aria-hidden="true" />
        {{ isLoading ? '更新中' : loadError || 'Yahoo 股市 RSS' }}
      </span>
    </div>

    <h1 id="hero-title">台股財經快訊</h1>

    <div v-if="isLoading" class="news-carousel__loading" aria-live="polite">
      載入最新市場新聞...
    </div>

    <div v-else-if="!newsItems.length" class="news-carousel__loading" aria-live="polite">
      暫時沒有可顯示的新聞，請稍後再試。
    </div>

    <Swiper
      v-else
      class="news-carousel__swiper"
      :modules="modules"
      :slides-per-view="1"
      :space-between="18"
      :speed="620"
      :loop="canLoop"
      :keyboard="{ enabled: true }"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }"
    >
      <SwiperSlide v-for="item in newsItems" :key="item.id">
        <article class="news-slide">
          <div class="news-slide__meta">
            <span>{{ item.source }}</span>
            <time :datetime="item.publishedAt">{{ formatNewsTime(item.publishedAt) }}</time>
          </div>
          <a class="news-slide__title" :href="item.url" target="_blank" rel="noreferrer">
            {{ item.title }}
            <ExternalLink :size="16" aria-hidden="true" />
          </a>
          <p>{{ item.summary }}</p>
        </article>
      </SwiperSlide>
    </Swiper>

    <time v-if="lastUpdated" class="news-carousel__updated" :datetime="lastUpdated.toISOString()">
      最後同步 {{ formatNewsTime(lastUpdated) }}
    </time>
  </div>
</template>
