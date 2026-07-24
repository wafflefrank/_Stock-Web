<script setup>
import { computed } from 'vue'

const props = defineProps({
  values: {
    type: Array,
    required: true
  },
  positive: {
    type: Boolean,
    default: true
  }
})

const width = 620
const height = 240
const padding = 14

const chartPoints = computed(() => {
  const values = props.values.map(Number)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = (width - padding * 2) / (values.length - 1 || 1)

  return values.map((value, index) => {
    const x = padding + index * step
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
})

const linePoints = computed(() => chartPoints.value.join(' '))

const areaPoints = computed(() => {
  const firstX = chartPoints.value[0]?.split(',')[0] ?? padding
  const lastX = chartPoints.value.at(-1)?.split(',')[0] ?? width - padding
  return `${firstX},${height - padding} ${linePoints.value} ${lastX},${height - padding}`
})
</script>

<template>
  <svg
    class="market-chart"
    :class="{ 'market-chart--negative': !positive }"
    viewBox="0 0 620 240"
    role="img"
    aria-label="Selected stock intraday trend"
  >
    <defs>
      <linearGradient id="chartFillPositive" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0.34" />
        <stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="chartFillNegative" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.28" />
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g class="market-chart__grid">
      <line x1="14" x2="606" y1="56" y2="56" />
      <line x1="14" x2="606" y1="120" y2="120" />
      <line x1="14" x2="606" y1="184" y2="184" />
    </g>
    <polygon
      class="market-chart__area"
      :points="areaPoints"
      :fill="positive ? 'url(#chartFillPositive)' : 'url(#chartFillNegative)'"
    />
    <polyline class="market-chart__line" :points="linePoints" />
    <circle
      v-if="chartPoints.length"
      class="market-chart__dot"
      :cx="chartPoints.at(-1).split(',')[0]"
      :cy="chartPoints.at(-1).split(',')[1]"
      r="5"
    />
  </svg>
</template>
