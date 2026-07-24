<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  decimals: {
    type: Number,
    default: 2
  },
  duration: {
    type: Number,
    default: 900
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  showSign: {
    type: Boolean,
    default: false
  },
  formatter: {
    type: Function,
    default: null
  }
})

const displayValue = ref(0)
const isAnimating = ref(false)
let frameId = 0
let hasRendered = false

const displayText = computed(() => formatDisplayValue(displayValue.value))

watch(
  () => props.value,
  (nextValue) => {
    const target = Number(nextValue) || 0

    if (shouldSkipAnimation()) {
      displayValue.value = target
      hasRendered = true
      return
    }

    if (!hasRendered) {
      hasRendered = true
      animateToValue(0, target)
      return
    }

    animateToValue(displayValue.value, target)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (frameId) {
    cancelAnimationFrame(frameId)
  }
})

function animateToValue(start, target) {
  if (frameId) {
    cancelAnimationFrame(frameId)
  }

  const startedAt = performance.now()
  const delta = target - start

  if (Math.abs(delta) < 0.0001) {
    displayValue.value = target
    isAnimating.value = false
    return
  }

  isAnimating.value = true

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / props.duration, 1)
    const eased = easeOutCubic(progress)
    displayValue.value = start + delta * eased

    if (progress < 1) {
      frameId = requestAnimationFrame(tick)
    } else {
      displayValue.value = target
      isAnimating.value = false
      frameId = 0
    }
  }

  frameId = requestAnimationFrame(tick)
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3)
}

function shouldSkipAnimation() {
  return (
    props.duration <= 0 ||
    typeof window === 'undefined' ||
    import.meta.env?.MODE === 'test' ||
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

function formatDisplayValue(value) {
  if (props.formatter) {
    return props.formatter(value)
  }

  const sign = props.showSign && value > 0 ? '+' : ''
  const number = value.toLocaleString('zh-TW', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals
  })

  return `${sign}${props.prefix}${number}${props.suffix}`
}
</script>

<template>
  <span class="odometer" :class="{ 'is-animating': isAnimating }">{{ displayText }}</span>
</template>
