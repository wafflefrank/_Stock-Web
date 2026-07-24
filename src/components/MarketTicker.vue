<script setup>
import ArrowDownRight from 'lucide-vue-next/dist/esm/icons/arrow-down-right.js'
import ArrowUpRight from 'lucide-vue-next/dist/esm/icons/arrow-up-right.js'
import OdometerNumber from './OdometerNumber.vue'

defineProps({
  indices: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <section class="ticker-strip" aria-label="Market indices">
    <div
      v-for="index in indices"
      :key="index.symbol"
      class="ticker-strip__item"
      :class="{ 'is-negative': index.change < 0 }"
    >
      <span class="ticker-strip__identity">
        <span class="ticker-strip__symbol">{{ index.symbol }}</span>
        <small>{{ index.label }}</small>
      </span>
      <strong><OdometerNumber :value="index.value" /></strong>
      <span class="ticker-strip__change">
        <ArrowUpRight v-if="index.change >= 0" :size="14" aria-hidden="true" />
        <ArrowDownRight v-else :size="14" aria-hidden="true" />
        <OdometerNumber :value="index.change" :decimals="2" suffix="%" show-sign />
      </span>
    </div>
  </section>
</template>
