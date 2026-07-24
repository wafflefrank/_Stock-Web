<script setup>
import ArrowDownRight from 'lucide-vue-next/dist/esm/icons/arrow-down-right.js'
import ArrowUpRight from 'lucide-vue-next/dist/esm/icons/arrow-up-right.js'
import OdometerNumber from './OdometerNumber.vue'

defineProps({
  stock: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])

const formatTwdPrice = (value) =>
  `NT$${Number(value).toLocaleString('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
</script>

<template>
  <button
    class="stock-row"
    :class="{ 'is-active': active, 'is-negative': stock.change < 0 }"
    type="button"
    :aria-pressed="active"
    :aria-label="`Select ${stock.symbol}`"
    @click="$emit('select', stock.symbol)"
  >
    <span class="stock-row__main">
      <strong>{{ stock.symbol }}</strong>
      <small>{{ stock.company }}</small>
    </span>
    <span class="stock-row__meta">{{ stock.sector }}</span>
    <span class="stock-row__price">
      <OdometerNumber :value="stock.price" :formatter="formatTwdPrice" />
    </span>
    <span class="stock-row__change">
      <ArrowUpRight v-if="stock.change >= 0" :size="14" aria-hidden="true" />
      <ArrowDownRight v-else :size="14" aria-hidden="true" />
      {{ stock.change > 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
    </span>
  </button>
</template>
