<script setup>
import OdometerNumber from './OdometerNumber.vue'

defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: 'neutral',
    validator: (value) => ['neutral', 'positive', 'negative', 'warning'].includes(value)
  },
  animatedValue: {
    type: Number,
    default: null
  },
  suffix: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <article class="metric-card" :class="`metric-card--${tone}`">
    <p>{{ label }}</p>
    <strong>
      <OdometerNumber
        v-if="animatedValue !== null"
        :value="animatedValue"
        :decimals="0"
        :suffix="suffix"
      />
      <template v-else>{{ value }}</template>
    </strong>
    <span v-if="detail">{{ detail }}</span>
  </article>
</template>
