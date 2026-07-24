<script setup>
import { computed, onMounted, ref } from 'vue'
import ExternalLink from 'lucide-vue-next/dist/esm/icons/external-link.js'
import LoaderCircle from 'lucide-vue-next/dist/esm/icons/loader-circle.js'
import Newspaper from 'lucide-vue-next/dist/esm/icons/newspaper.js'
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { fetchTaiwanFinanceNews } from '../services/taiwanNewsApi'

const modules = [A11y, Autoplay, Keyboard, Navigation, Pagination]
const newsItems = ref([])
const isLoading = ref(true)

const canLoop = computed(() => newsItems.value.length > 1)

onMounted(async () => {
  newsItems.value = await fetchTaiwanFinanceNews()
  isLoading.value = false
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
        {{ isLoading ? '更新中' : 'Yahoo 股市 RSS' }}
      </span>
    </div>

    <h1 id="hero-title">台股財經快訊</h1>

    <div v-if="isLoading" class="news-carousel__loading" aria-live="polite">
      載入最新市場新聞...
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
      :navigation="canLoop"
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
  </div>
</template>
